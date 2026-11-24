import type { AppData, DayData, Subject } from '../types';
import { addDays, plannerDayStart, todayKey, uid } from './date';

export const STORAGE_KEY = 'motemote-study:v1';
export const DATA_VERSION = 1;

export const COLOR_PALETTE = [
  '#FF6B6B',
  '#FF9F43',
  '#FFC93C',
  '#4ECB71',
  '#2EC4B6',
  '#4D7CFE',
  '#7C6BF5',
  '#B36BF5',
  '#FF6FB5',
  '#8D8D99',
];

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub_quality', name: '품질경영기사', color: '#FF6B6B' },
  { id: 'sub_safety', name: '산업안전기사', color: '#4D7CFE' },
  { id: 'sub_english', name: '토익 / 오픽', color: '#FFC93C' },
  { id: 'sub_school', name: '학교 전공·팀플', color: '#4ECB71' },
  { id: 'sub_history', name: '한국사', color: '#B36BF5' },
];

export function emptyDay(): DayData {
  return { tasks: [], memo: '', marks: {} };
}

export function createDefaultData(): AppData {
  return {
    version: DATA_VERSION,
    subjects: DEFAULT_SUBJECTS.map((s) => ({ ...s })),
    ddays: [
      { id: 'dday_history_exam', title: '제82회 한능검 접수', date: '2027-01-12' },
      { id: 'dday_engineer_apply', title: '정기기사 1회 필기 접수', date: '2027-01-18' },
      { id: 'dday_engineer_exam', title: '정기기사 1회 필기 시작', date: '2027-02-12' },
    ],
    sessions: [],
    days: {},
    settings: { theme: 'system', wakeLock: false, autoCarry: true },
    timer: null,
  };
}

export function loadData(): AppData {
  const base = createDefaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<AppData>;
    if (!parsed || typeof parsed !== 'object') return base;
    return {
      version: DATA_VERSION,
      subjects: Array.isArray(parsed.subjects) && parsed.subjects.length > 0 ? parsed.subjects : base.subjects,
      ddays: Array.isArray(parsed.ddays) ? parsed.ddays : base.ddays,
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      days: parsed.days && typeof parsed.days === 'object' ? parsed.days : {},
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      timer: parsed.timer ?? null,
    };
  } catch {
    return base;
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* 저장 공간이 꽉 찬 경우 조용히 넘어간다 (앱은 계속 동작) */
  }
}

/** 어제 하루치 예시 기록: 세션 · 과목 색칠 · 할 일 */
export function buildSampleDay(data: AppData): { date: string; day: DayData; sessions: AppData['sessions'] } {
  const date = addDays(todayKey(), -1);
  const dayStart = plannerDayStart(date);
  const at = (hour: number, minute = 0) => dayStart + hour * 3600000 + minute * 60000;

  const blocks: Array<[string, number, number, number, number]> = [
    ['sub_quality', 9, 10, 10, 40],
    ['sub_safety', 10, 50, 12, 10],
    ['sub_english', 14, 0, 15, 20],
    ['sub_quality', 16, 0, 16, 50],
    ['sub_school', 20, 10, 21, 40],
  ];

  const sessions = blocks.map(([subjectId, sh, sm, eh, em]) => ({
    id: uid('ses'),
    subjectId,
    start: at(sh, sm),
    end: at(eh, em),
  }));

  const tasks: DayData['tasks'] = [
    { id: uid('task'), subjectId: 'sub_quality', text: '품질경영기사 1과목 기출 20문제', status: 'done' },
    { id: uid('task'), subjectId: 'sub_safety', text: '산업안전기사 2과목 요약노트 복습', status: 'done' },
    { id: uid('task'), subjectId: 'sub_english', text: 'OPIc 스크립트 3개 암기', status: 'doing' },
    { id: uid('task'), subjectId: 'sub_school', text: '팀플 발표 자료 정리', status: 'todo' },
  ];

  const subject = data.subjects.find((s) => s.id === 'sub_history') ?? data.subjects[0];
  void subject;

  return {
    date,
    day: { tasks, memo: '샘플 기록이에요. 지우고 내 기록을 채워 보세요.', marks: {} },
    sessions,
  };
}
