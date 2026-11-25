/* 영어 말하기 학습 — 데이터 로딩 · 내 스크립트 저장 · 문장/속도 도우미 */

export type SpeakingAudio = { q?: string; a?: string; p?: string };

export type Expression = { en: string; ko: string };

export type FollowUp = { q: string; qKo?: string };

export type OpicQuestion = {
  id: string;
  q: string;
  qKo: string;
  a: string;
  aKo: string;
  expr: Expression[];
  follow: FollowUp[];
  audio: SpeakingAudio;
};

export type OpicTopic = {
  id: string;
  title: string;
  emoji: string;
  questions: OpicQuestion[];
};

export type ToeicTable = {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type ToeicQuestion = {
  id: string;
  q: string;
  qKo?: string;
  passage?: string;
  guide?: string;
  sceneKo?: string;
  a?: string;
  aKo?: string;
  expr?: Expression[];
  follow?: FollowUp[];
  answerSec: number;
  audio: SpeakingAudio;
};

export type ToeicPart = {
  id: string;
  part: number;
  title: string;
  subtitle: string;
  range: string;
  prepSec: number;
  answerSec: number;
  readSec: number;
  timingNote: string;
  tips: string[];
  sceneNote?: string;
  table?: ToeicTable;
  questions: ToeicQuestion[];
};

export type MorningCard = {
  id: string;
  kind: 'word' | 'pattern' | 'sentence';
  front: string;
  back: string;
  example: string;
  note: string;
  tag: string;
  day: string;
  audio: string;
  speakText: string;
};

export type SpeakingData = {
  version: number;
  generatedAt: string;
  source: string;
  opic: { label: string; note: string; topics: OpicTopic[] };
  toeic: { label: string; note: string; parts: ToeicPart[] };
  morning: {
    label: string;
    note: string;
    days: string[];
    counts: { word: number; pattern: number; sentence: number };
    cards: MorningCard[];
  };
  stats: {
    opicTopics: number;
    opicQuestions: number;
    toeicParts: number;
    toeicQuestions: number;
    morningCards: number;
  };
};

export const SPEAKING_DATA_PATH = 'data/speaking-data.json';
export const SPEAKING_STORAGE_KEY = 'motemote-study:speaking:v1';
export const SPEAKING_UPDATED_EVENT = 'motemote:speaking-updated';

/* ---------- 데이터 (영어 탭의 말하기를 처음 열 때 한 번만 내려받는다) ---------- */

let dataCache: SpeakingData | null = null;
let inflight: Promise<SpeakingData> | null = null;

export function loadSpeakingData(): Promise<SpeakingData> {
  if (dataCache) return Promise.resolve(dataCache);
  if (inflight) return inflight;
  const url = new URL(SPEAKING_DATA_PATH, document.baseURI).toString();
  inflight = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`말하기 데이터를 불러오지 못했어요 (HTTP ${res.status})`);
      return res.json() as Promise<SpeakingData>;
    })
    .then((data) => {
      dataCache = data;
      inflight = null;
      return data;
    })
    .catch((err) => {
      inflight = null;
      throw err;
    });
  return inflight;
}

/** 오디오 경로 → 실제 URL (GitHub Pages 하위 경로에서도 동작) */
export function audioUrl(path?: string): string | null {
  if (!path) return null;
  return new URL(path, document.baseURI).toString();
}

/* ---------- 내 스크립트 · 설정 (localStorage) ---------- */

export type MyScript = {
  id: string;
  title: string;
  question: string;
  answer: string;
  note: string;
  createdAt: number;
  updatedAt: number;
};

export type SpeakingStore = {
  version: 1;
  scripts: MyScript[];
  /** 마지막으로 고른 재생 속도 */
  rate: number;
  updatedAt: number;
};

export const RATES = [0.7, 0.85, 1, 1.1];

export function emptySpeakingStore(): SpeakingStore {
  return { version: 1, scripts: [], rate: 0.85, updatedAt: 0 };
}

export function normalizeSpeakingStore(raw: unknown): SpeakingStore {
  const base = emptySpeakingStore();
  if (!raw || typeof raw !== 'object') return base;
  const obj = raw as Partial<SpeakingStore>;
  const scripts = Array.isArray(obj.scripts)
    ? obj.scripts
        .filter((s) => s && typeof s === 'object')
        .map((s, i) => {
          const item = s as Partial<MyScript>;
          const now = Date.now();
          return {
            id: typeof item.id === 'string' && item.id ? item.id : `migrated-${i}-${now}`,
            title: String(item.title ?? '').slice(0, 120),
            question: String(item.question ?? ''),
            answer: String(item.answer ?? ''),
            note: String(item.note ?? ''),
            createdAt: typeof item.createdAt === 'number' ? item.createdAt : now,
            updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : now,
          };
        })
    : [];
  return {
    version: 1,
    scripts,
    rate: RATES.includes(Number(obj.rate)) ? Number(obj.rate) : base.rate,
    updatedAt: typeof obj.updatedAt === 'number' ? obj.updatedAt : 0,
  };
}

export function loadSpeakingStore(): SpeakingStore {
  try {
    const raw = localStorage.getItem(SPEAKING_STORAGE_KEY);
    if (!raw) return emptySpeakingStore();
    return normalizeSpeakingStore(JSON.parse(raw));
  } catch {
    return emptySpeakingStore();
  }
}

export function saveSpeakingStore(store: SpeakingStore): void {
  try {
    localStorage.setItem(SPEAKING_STORAGE_KEY, JSON.stringify({ ...store, updatedAt: Date.now() }));
  } catch {
    /* 저장 공간이 꽉 차도 앱은 계속 동작한다 */
  }
}

/** 설정 탭에서 백업을 불러왔을 때 말하기 화면에 알린다. */
export function broadcastSpeakingChange(): void {
  try {
    window.dispatchEvent(new CustomEvent(SPEAKING_UPDATED_EVENT));
  } catch {
    /* 무시 */
  }
}

export function newScriptId(): string {
  return `script-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ---------- 문장 나누기 · 시간 표기 ---------- */

/** 영어 문장을 따라 읽기 단위로 나눈다. 약어(Mr., a.m., e.g.)에서 끊기지 않게 다음 조각과 붙인다. */
export function splitSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (!cleaned) return [];
  const parts = (cleaned.match(/[^.!?]+[.!?]+["')\]]?|[^.!?]+$/g) ?? [cleaned])
    .map((s) => s.trim())
    .filter(Boolean);
  const out: string[] = [];
  let buffer = '';
  for (const piece of parts) {
    buffer = buffer ? `${buffer} ${piece}` : piece;
    if (/(\b[A-Za-z]\.|a\.m\.|p\.m\.|Mr\.|Ms\.|Dr\.|e\.g\.|i\.e\.)$/i.test(buffer)) continue;
    out.push(buffer);
    buffer = '';
  }
  if (buffer) out.push(buffer);
  return out.length ? out : [cleaned];
}

/** 65 → "1:05" */
export function formatClock(totalSec: number): string {
  const safe = Math.max(0, Math.ceil(totalSec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ---------- 마지막으로 보던 화면 기억 ---------- */

export const ENGLISH_MODE_KEY = 'motemote-study:english-mode';
export const SPEAKING_MODE_KEY = 'motemote-study:speaking-mode';

export function readMode<T extends string>(key: string, allowed: readonly T[], fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return allowed.includes(raw as T) ? (raw as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeMode(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 무시 */
  }
}

/** 카드 종류 한국어 이름 */
export function kindLabel(kind: string): string {
  if (kind === 'pattern') return '패턴';
  if (kind === 'sentence') return '교정';
  return '단어';
}
