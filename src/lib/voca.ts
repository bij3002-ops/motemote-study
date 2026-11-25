/* 노랭이 토익 단어장 — 데이터 로딩 · 학습 기록 저장 · 발음(TTS) 유틸 */

export type VocaPart = {
  /** 덱의 파트 번호 ('01' ~ '04') */
  id: string;
  name: string;
  label: string;
  index: number;
  count: number;
  days: number;
};

export type VocaWord = {
  /** 0부터 시작하는 전체 순번 — 즐겨찾기·외움·오답 기록의 키 */
  i: number;
  word: string;
  meaning: string;
  part: number;
  day: number;
};

export type VocaData = {
  version: number;
  source: string;
  count: number;
  parts: VocaPart[];
  words: VocaWord[];
};

type RawVocaData = {
  version: number;
  source: string;
  count: number;
  parts: VocaPart[];
  words: Array<[string, string, number, number]>;
};

export const VOCA_DATA_PATH = 'data/noraengi-words.json';
export const VOCA_STORAGE_KEY = 'motemote-study:voca:v1';
export const VOCA_UPDATED_EVENT = 'motemote:voca-updated';

export type VocaProgress = {
  version: 1;
  /** 외운 단어 index */
  known: number[];
  /** 즐겨찾기 단어 index */
  favorites: number[];
  /** 오답노트 단어 index */
  wrong: number[];
  /** 마지막으로 보던 파트·DAY */
  last: { part: number; day: number };
  updatedAt: number;
};

export function emptyProgress(): VocaProgress {
  return { version: 1, known: [], favorites: [], wrong: [], last: { part: 0, day: 1 }, updatedAt: 0 };
}

/* ---------- 데이터 (단어장 탭을 처음 열 때 한 번만 내려받는다) ---------- */

let dataCache: VocaData | null = null;
let inflight: Promise<VocaData> | null = null;

export function loadVocaData(): Promise<VocaData> {
  if (dataCache) return Promise.resolve(dataCache);
  if (inflight) return inflight;

  const url = new URL(VOCA_DATA_PATH, document.baseURI).toString();
  inflight = fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`단어 데이터를 불러오지 못했어요 (HTTP ${res.status})`);
      return res.json() as Promise<RawVocaData>;
    })
    .then((raw) => {
      const data: VocaData = {
        version: raw.version,
        source: raw.source,
        count: raw.words.length,
        parts: raw.parts,
        words: raw.words.map((row, i) => ({
          i,
          word: row[0],
          meaning: row[1],
          part: row[2],
          day: row[3],
        })),
      };
      dataCache = data;
      inflight = null;
      return data;
    })
    .catch((err: unknown) => {
      inflight = null;
      throw err;
    });

  return inflight;
}

export function cachedVocaData(): VocaData | null {
  return dataCache;
}

/* ---------- 학습 기록 ---------- */

function toIndexArray(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const out: number[] = [];
  for (const v of value) {
    if (typeof v === 'number' && Number.isInteger(v) && v >= 0) out.push(v);
  }
  return out;
}

export function normalizeProgress(value: unknown): VocaProgress {
  const base = emptyProgress();
  if (!value || typeof value !== 'object') return base;
  const raw = value as Partial<VocaProgress>;
  const last = raw.last && typeof raw.last === 'object' ? raw.last : base.last;
  return {
    version: 1,
    known: toIndexArray(raw.known),
    favorites: toIndexArray(raw.favorites),
    wrong: toIndexArray(raw.wrong),
    last: {
      part: Number.isInteger(last.part) && last.part >= 0 && last.part < 4 ? last.part : 0,
      day: Number.isInteger(last.day) && last.day >= 1 && last.day <= 30 ? last.day : 1,
    },
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : 0,
  };
}

export function loadProgress(): VocaProgress {
  try {
    const raw = localStorage.getItem(VOCA_STORAGE_KEY);
    if (!raw) return emptyProgress();
    return normalizeProgress(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress: VocaProgress): void {
  try {
    localStorage.setItem(VOCA_STORAGE_KEY, JSON.stringify(progress));
  } catch {
    /* 저장 공간이 꽉 차도 앱은 계속 동작한다 */
  }
}

/** 설정 탭 백업 불러오기 등 다른 화면에서 기록을 바꿨을 때 단어장 탭에 알린다. */
export function broadcastProgressChange(): void {
  try {
    window.dispatchEvent(new CustomEvent(VOCA_UPDATED_EVENT));
  } catch {
    /* CustomEvent를 지원하지 않는 환경은 새로고침 없이도 다음 조작에서 반영된다 */
  }
}

/* ---------- 조회 도우미 ---------- */

export function wordsOfDay(data: VocaData, part: number, day: number): VocaWord[] {
  return data.words.filter((w) => w.part === part && w.day === day);
}

export function wordsOfPart(data: VocaData, part: number): VocaWord[] {
  return data.words.filter((w) => w.part === part);
}

export function countKnown(words: VocaWord[], known: Set<number>): number {
  let n = 0;
  for (const w of words) if (known.has(w.i)) n += 1;
  return n;
}

/** 검색용: 악센트(résumé → resume)와 대소문자를 무시한다. */
export function normalizeSearch(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Fisher–Yates */
export function shuffle<T>(items: T[]): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- 발음 듣기 (Web Speech API) ---------- */

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

let voiceWarm = false;

/** iOS Safari는 첫 사용자 제스처 안에서 호출해야 소리가 난다. 클릭 핸들러에서 바로 부른다. */
export function speakEnglish(text: string, rate = 0.92): boolean {
  if (!canSpeak()) return false;
  try {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = rate;
    utterance.pitch = 1;

    if (!voiceWarm) {
      // iOS는 getVoices()가 처음엔 빈 배열이고 voiceschanged 뒤에 채워진다.
      voiceWarm = true;
      synth.addEventListener?.('voiceschanged', () => undefined, { once: true });
    }
    const voices = synth.getVoices();
    const preferred =
      voices.find((v) => /en[-_]US/i.test(v.lang) && /samantha|google|natural/i.test(v.name)) ||
      voices.find((v) => /en[-_]US/i.test(v.lang)) ||
      voices.find((v) => /^en/i.test(v.lang));
    if (preferred) utterance.voice = preferred;

    synth.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking(): void {
  if (!canSpeak()) return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* 무시 */
  }
}
