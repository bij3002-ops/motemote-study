/* =========================================================
   기출 CBT — 데이터 로딩 · 채점 · 응시 기록 저장
   ========================================================= */

export type ExamId = 'quality' | 'jeongcheo';
export type Choice = 1 | 2 | 3 | 4;

export type CbtQuestion = {
  n: number;
  subject: number;
  body: string;
  choices: string[];
  answer: number;
  image?: string;
  imageW?: number;
  imageH?: number;
  explain?: string;
};

export type RoundData = {
  exam: ExamId;
  examName: string;
  round: string;
  label: string;
  date: string;
  subjects: string[];
  questions: CbtQuestion[];
};

export type RoundMeta = {
  id: string;
  label: string;
  date: string;
  count: number;
  images: number;
  explanations: number;
  file: string;
};

export type ExamMeta = {
  id: ExamId;
  name: string;
  subjects: string[];
  rounds: RoundMeta[];
};

export type CbtIndex = { version: number; generatedAt?: string; exams: ExamMeta[] };

export type SubjectScore = {
  subject: number;
  name: string;
  correct: number;
  total: number;
  score: number;
  failed: boolean;
};

export type Attempt = {
  id: string;
  exam: ExamId;
  examName: string;
  round: string;
  roundLabel: string;
  scope: 'full' | number;
  startedAt: number;
  endedAt: number;
  usedSec: number;
  answers: Record<string, number>;
  correct: number;
  total: number;
  score: number;
  subjects: SubjectScore[];
  passed: boolean | null;
};

export type Mark = { exam: ExamId; round: string; n: number; at: number };

export type CbtSaved = {
  v: 1;
  attempts: Attempt[];
  wrong: Record<string, Mark>;
  stars: Record<string, Mark>;
  last: { exam: ExamId; round: string | null };
};

export const CBT_STORAGE_KEY = 'motemote-study:cbt:v1';
export const CBT_DRAFT_KEY = 'motemote-study:cbt:draft:v1';
const CBT_INDEX_PATH = 'data/cbt/index.json';

export const EXAM_ORDER: ExamId[] = ['quality', 'jeongcheo'];
export const PASS_SCORE = 60;
export const FAIL_LINE = 40;
/** 필기 시험 시간: 100문항 150분 */
export const EXAM_SECONDS = 150 * 60;

/* ---------- 저장 ---------- */

export function emptyCbt(): CbtSaved {
  return { v: 1, attempts: [], wrong: {}, stars: {}, last: { exam: 'quality', round: null } };
}

export function normalizeCbt(raw: unknown): CbtSaved {
  const base = emptyCbt();
  if (!raw || typeof raw !== 'object') return base;
  const v = raw as Partial<CbtSaved>;
  const attempts = Array.isArray(v.attempts) ? v.attempts.filter((a) => a && typeof a === 'object') : [];
  const cleanMarks = (input: unknown): Record<string, Mark> => {
    const out: Record<string, Mark> = {};
    if (!input || typeof input !== 'object') return out;
    for (const [k, m] of Object.entries(input as Record<string, Mark>)) {
      if (m && typeof m === 'object' && typeof m.n === 'number' && (m.exam === 'quality' || m.exam === 'jeongcheo')) {
        out[k] = { exam: m.exam, round: String(m.round), n: m.n, at: Number(m.at) || 0 };
      }
    }
    return out;
  };
  const exam = v.last?.exam === 'jeongcheo' ? 'jeongcheo' : 'quality';
  return {
    v: 1,
    attempts,
    wrong: cleanMarks(v.wrong),
    stars: cleanMarks(v.stars),
    last: { exam, round: typeof v.last?.round === 'string' ? v.last.round : null },
  };
}

export function loadCbt(): CbtSaved {
  try {
    const raw = localStorage.getItem(CBT_STORAGE_KEY);
    if (!raw) return emptyCbt();
    return normalizeCbt(JSON.parse(raw));
  } catch {
    return emptyCbt();
  }
}

export function saveCbt(value: CbtSaved): void {
  try {
    localStorage.setItem(CBT_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* 저장 공간이 꽉 차도 앱은 계속 동작한다 */
  }
}

export const markKey = (exam: ExamId, round: string, n: number) => `${exam}:${round}:${n}`;

/* ---------- 실전 모의고사 진행 상태 (탭을 옮겨도 이어서) ---------- */

export type CbtDraft = {
  exam: ExamId;
  round: string;
  scope: 'full' | number;
  answers: Record<string, number>;
  current: number;
  startedAt: number;
  deadline: number;
};

export function loadDraft(): CbtDraft | null {
  try {
    const raw = localStorage.getItem(CBT_DRAFT_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw) as CbtDraft;
    if (!d || (d.exam !== 'quality' && d.exam !== 'jeongcheo') || !d.round) return null;
    return d;
  } catch {
    return null;
  }
}

export function saveDraft(draft: CbtDraft | null): void {
  try {
    if (!draft) localStorage.removeItem(CBT_DRAFT_KEY);
    else localStorage.setItem(CBT_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* ignore */
  }
}

/* ---------- 데이터 내려받기 ---------- */

let indexCache: CbtIndex | null = null;
let indexInflight: Promise<CbtIndex> | null = null;
const roundCache = new Map<string, RoundData>();
const roundInflight = new Map<string, Promise<RoundData>>();

const url = (path: string) => new URL(path, document.baseURI).toString();
export const assetUrl = (path: string) => url(`data/${path}`);

export function loadIndex(): Promise<CbtIndex> {
  if (indexCache) return Promise.resolve(indexCache);
  if (indexInflight) return indexInflight;
  indexInflight = fetch(url(CBT_INDEX_PATH))
    .then((res) => {
      if (!res.ok) throw new Error(`기출 목록을 불러오지 못했어요 (HTTP ${res.status})`);
      return res.json() as Promise<CbtIndex>;
    })
    .then((data) => {
      indexCache = data;
      indexInflight = null;
      return data;
    })
    .catch((err: unknown) => {
      indexInflight = null;
      throw err;
    });
  return indexInflight;
}

export function loadRound(exam: ExamId, round: string): Promise<RoundData> {
  const key = `${exam}:${round}`;
  const cached = roundCache.get(key);
  if (cached) return Promise.resolve(cached);
  const running = roundInflight.get(key);
  if (running) return running;
  const p = fetch(url(`data/cbt/${exam}-${round}.json`))
    .then((res) => {
      if (!res.ok) throw new Error(`기출문제를 불러오지 못했어요 (HTTP ${res.status})`);
      return res.json() as Promise<RoundData>;
    })
    .then((data) => {
      roundCache.set(key, data);
      roundInflight.delete(key);
      return data;
    })
    .catch((err: unknown) => {
      roundInflight.delete(key);
      throw err;
    });
  roundInflight.set(key, p);
  return p;
}

/* ---------- 채점 ---------- */

export function gradeRound(
  data: RoundData,
  answers: Record<string, number>,
  scope: 'full' | number,
): { correct: number; total: number; score: number; subjects: SubjectScore[]; passed: boolean | null } {
  const list = scope === 'full' ? data.questions : data.questions.filter((q) => q.subject === scope);
  const bySubject = new Map<number, { correct: number; total: number }>();
  let correct = 0;
  for (const q of list) {
    const got = answers[String(q.n)];
    const ok = got === q.answer;
    if (ok) correct += 1;
    const row = bySubject.get(q.subject) ?? { correct: 0, total: 0 };
    row.total += 1;
    if (ok) row.correct += 1;
    bySubject.set(q.subject, row);
  }
  const subjects: SubjectScore[] = [...bySubject.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([subject, row]) => {
      const score = row.total ? Math.round((row.correct / row.total) * 100) : 0;
      return {
        subject,
        name: data.subjects[subject - 1] ?? `${subject}과목`,
        correct: row.correct,
        total: row.total,
        score,
        failed: row.total > 0 && score < FAIL_LINE,
      };
    });
  const total = list.length;
  const score = total ? Math.round((correct / total) * 100) : 0;
  const passed = scope === 'full' && total > 0 ? score >= PASS_SCORE && !subjects.some((s) => s.failed) : null;
  return { correct, total, score, subjects, passed };
}

export function scopeLabel(scope: 'full' | number, data?: RoundData): string {
  if (scope === 'full') return '전체 100문항';
  return data ? `${scope}과목 20문항` : `${scope}과목`;
}

export function formatClock(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(r).padStart(2, '0')}`
    : `${m}:${String(r).padStart(2, '0')}`;
}

export function formatUsed(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 1) return `${Math.max(1, sec)}초`;
  return `${m}분`;
}

export const CHOICE_LABEL = ['①', '②', '③', '④'];
