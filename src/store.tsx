import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  AppData,
  DDay,
  DayData,
  RpgReward,
  Session,
  Settings,
  Subject,
  Task,
  TaskStatus,
  TimerMode,
} from './types';
import { addDays, plannerDayKey, uid } from './lib/date';
import { applyStudy, ITEMS, normalizeRpg, TITLES } from './lib/rpg';
import { buildSampleDay, createDefaultData, emptyDay, loadData, saveData } from './lib/storage';

const STATUS_CYCLE: TaskStatus[] = ['todo', 'doing', 'done', 'carry'];

export type Store = {
  data: AppData;
  subjects: Subject[];
  subjectById: (id: string) => Subject | undefined;
  dayOf: (date: string) => DayData;
  addSubject: (name: string, color: string) => string;
  updateSubject: (id: string, patch: Partial<Pick<Subject, 'name' | 'color'>>) => void;
  deleteSubject: (id: string) => void;
  addDDay: (title: string, date: string) => void;
  updateDDay: (id: string, patch: Partial<Pick<DDay, 'title' | 'date'>>) => void;
  deleteDDay: (id: string) => void;
  setMemo: (date: string, memo: string) => void;
  addTask: (date: string, subjectId: string, text: string) => void;
  cycleTask: (date: string, taskId: string) => void;
  deleteTask: (date: string, taskId: string) => void;
  setMark: (date: string, key: string, subjectId: string) => void;
  /** 공부 기록(세션) 하나만 지운다. 통계·타임테이블에서도 즉시 빠진다. */
  deleteSession: (id: string) => void;
  /** 공부 기록(세션)만 전부 비운다. 과목·D-Day·할 일·RPG·단어장은 그대로 둔다. */
  resetSessions: () => void;
  startTimer: (subjectId: string, mode: TimerMode) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  saveTimer: () => { session: Session | null; reward: RpgReward | null };
  advancePomodoro: () => RpgReward | null;
  buyTitle: (id: string) => boolean;
  equipTitle: (id: string) => void;
  buyItem: (id: string) => boolean;
  equipItem: (id: string) => void;
  setTimerMode: (mode: TimerMode) => void;
  setPomodoroLength: (focusMin: number, breakMin: number) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  importData: (data: AppData) => void;
  resetAll: () => void;
  fillSampleDay: () => string;
};

const StoreContext = createContext<Store | null>(null);

function ensureDay(days: Record<string, DayData>, date: string): DayData {
  return days[date] ?? emptyDay();
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData());
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    saveData(data);
  }, [data]);

  const update = useCallback((fn: (draft: AppData) => AppData) => {
    setData((prev) => fn(prev));
  }, []);

  const subjectById = useCallback(
    (id: string) => dataRef.current.subjects.find((s) => s.id === id),
    [],
  );

  const dayOf = useCallback((date: string) => ensureDay(dataRef.current.days, date), []);

  const addSubject = useCallback((name: string, color: string): string => {
    const trimmed = name.trim();
    if (!trimmed) return '';
    const id = uid('sub');
    update((d) => ({ ...d, subjects: [...d.subjects, { id, name: trimmed, color }] }));
    return id;
  }, [update]);

  const updateSubject = useCallback((id: string, patch: Partial<Pick<Subject, 'name' | 'color'>>) => {
    update((d) => ({
      ...d,
      subjects: d.subjects.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, [update]);

  const deleteSubject = useCallback((id: string) => {
    update((d) => {
      if (d.subjects.length <= 1) return d;
      const days: Record<string, DayData> = {};
      for (const [date, day] of Object.entries(d.days)) {
        const marks: Record<string, string> = {};
        for (const [key, value] of Object.entries(day.marks ?? {})) {
          if (value !== id) marks[key] = value;
        }
        days[date] = {
          ...day,
          tasks: (day.tasks ?? []).filter((t) => t.subjectId !== id),
          marks,
        };
      }
      return {
        ...d,
        subjects: d.subjects.filter((s) => s.id !== id),
        sessions: d.sessions.filter((s) => s.subjectId !== id),
        days,
        timer: d.timer && d.timer.subjectId === id ? null : d.timer,
      };
    });
  }, [update]);

  const addDDay = useCallback((title: string, date: string) => {
    const trimmed = title.trim();
    if (!trimmed || !date) return;
    update((d) => ({ ...d, ddays: [...d.ddays, { id: uid('dday'), title: trimmed, date }] }));
  }, [update]);

  const updateDDay = useCallback((id: string, patch: Partial<Pick<DDay, 'title' | 'date'>>) => {
    update((d) => ({ ...d, ddays: d.ddays.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
  }, [update]);

  const deleteDDay = useCallback((id: string) => {
    update((d) => ({ ...d, ddays: d.ddays.filter((x) => x.id !== id) }));
  }, [update]);

  const setMemo = useCallback((date: string, memo: string) => {
    update((d) => ({ ...d, days: { ...d.days, [date]: { ...ensureDay(d.days, date), memo } } }));
  }, [update]);

  const addTask = useCallback((date: string, subjectId: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const task: Task = { id: uid('task'), subjectId, text: trimmed, status: 'todo' };
    update((d) => {
      const day = ensureDay(d.days, date);
      return { ...d, days: { ...d.days, [date]: { ...day, tasks: [...day.tasks, task] } } };
    });
  }, [update]);

  const cycleTask = useCallback((date: string, taskId: string) => {
    update((d) => {
      const day = ensureDay(d.days, date);
      const tasks = day.tasks ?? [];
      const target = tasks.find((t) => t.id === taskId);
      if (!target) return d;
      const next = STATUS_CYCLE[(STATUS_CYCLE.indexOf(target.status) + 1) % STATUS_CYCLE.length];
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: next } : t));

      let days: Record<string, DayData> = { ...d.days, [date]: { ...day, tasks: updated } };
      if (next === 'carry' && d.settings.autoCarry) {
        const tomorrow = addDays(date, 1);
        const tomorrowDay = ensureDay(days, tomorrow);
        const exists = (tomorrowDay.tasks ?? []).some(
          (t) => t.text === target.text && t.subjectId === target.subjectId,
        );
        if (!exists) {
          const copy: Task = { id: uid('task'), subjectId: target.subjectId, text: target.text, status: 'todo' };
          days = { ...days, [tomorrow]: { ...tomorrowDay, tasks: [...tomorrowDay.tasks, copy] } };
        }
      }
      return { ...d, days };
    });
  }, [update]);

  const deleteTask = useCallback((date: string, taskId: string) => {
    update((d) => {
      const day = ensureDay(d.days, date);
      return {
        ...d,
        days: { ...d.days, [date]: { ...day, tasks: (day.tasks ?? []).filter((t) => t.id !== taskId) } },
      };
    });
  }, [update]);

  const setMark = useCallback((date: string, key: string, subjectId: string) => {
    update((d) => {
      const day = ensureDay(d.days, date);
      const marks = { ...(day.marks ?? {}) };
      if (subjectId === '') delete marks[key];
      else marks[key] = subjectId;
      return { ...d, days: { ...d.days, [date]: { ...day, marks } } };
    });
  }, [update]);

  const deleteSession = useCallback((id: string) => {
    update((d) => (d.sessions.some((s) => s.id === id) ? { ...d, sessions: d.sessions.filter((s) => s.id !== id) } : d));
  }, [update]);

  const resetSessions = useCallback(() => {
    update((d) => (d.sessions.length === 0 ? d : { ...d, sessions: [] }));
  }, [update]);

  const startTimer = useCallback((subjectId: string, mode: TimerMode) => {
    update((d) => ({
      ...d,
      timer: {
        subjectId,
        mode,
        startedAt: Date.now(),
        accumulated: 0,
        phase: 'focus',
        focusMin: d.timer?.focusMin ?? 25,
        breakMin: d.timer?.breakMin ?? 5,
      },
    }));
  }, [update]);

  const pauseTimer = useCallback(() => {
    update((d) => {
      if (!d.timer || d.timer.startedAt === null) return d;
      const now = Date.now();
      return {
        ...d,
        timer: { ...d.timer, accumulated: d.timer.accumulated + (now - d.timer.startedAt), startedAt: null },
      };
    });
  }, [update]);

  const resumeTimer = useCallback(() => {
    update((d) => (d.timer ? { ...d, timer: { ...d.timer, startedAt: Date.now() } } : d));
  }, [update]);

  const resetTimer = useCallback(() => {
    update((d) => ({ ...d, timer: d.timer ? { ...d.timer, startedAt: null, accumulated: 0, phase: 'focus' } : null }));
  }, [update]);

  const saveTimer = useCallback((): { session: Session | null; reward: RpgReward | null } => {
    const current = dataRef.current;
    const timer = current.timer;
    if (!timer) return { session: null, reward: null };
    const elapsed = timer.accumulated + (timer.startedAt ? Date.now() - timer.startedAt : 0);
    const shouldSave = timer.mode === 'stopwatch' ? elapsed >= 60000 : timer.phase === 'focus' && elapsed >= 60000;
    let session: Session | null = null;
    let reward: RpgReward | null = null;
    let rpg = current.rpg;
    if (shouldSave) {
      const end = Date.now();
      session = { id: uid('ses'), subjectId: timer.subjectId, start: end - elapsed, end };
      // 공부한 분만큼 몬스터에게 데미지 · 보상 지급
      const applied = applyStudy(current.rpg, elapsed / 60000);
      rpg = applied.rpg;
      reward = applied.reward;
    }
    update((d) => ({
      ...d,
      sessions: session ? [...d.sessions, session] : d.sessions,
      rpg,
      timer: d.timer ? { ...d.timer, startedAt: null, accumulated: 0, phase: 'focus' } : null,
    }));
    return { session, reward };
  }, [update]);

  /** 뽀모도로 한 단계(집중/휴식)가 끝났을 때 호출. 집중이 끝났으면 RPG 보상을 돌려준다. */
  const advancePomodoro = useCallback((): RpgReward | null => {
    const current = dataRef.current;
    const timer = current.timer;
    if (!timer || timer.mode !== 'pomodoro' || timer.startedAt === null) return null;
    const now = Date.now();
    const elapsed = timer.accumulated + (now - timer.startedAt);
    const phaseMs = (timer.phase === 'focus' ? timer.focusMin : timer.breakMin) * 60000;
    if (elapsed < phaseMs) return null;

    const overshoot = Math.min(elapsed - phaseMs, phaseMs);
    const phaseEnd = now - overshoot;
    let sessions = current.sessions;
    let rpg = current.rpg;
    let reward: RpgReward | null = null;
    if (timer.phase === 'focus') {
      const start = phaseEnd - timer.focusMin * 60000;
      sessions = [...sessions, { id: uid('ses'), subjectId: timer.subjectId, start, end: phaseEnd }];
      const applied = applyStudy(current.rpg, timer.focusMin);
      rpg = applied.rpg;
      reward = applied.reward;
    }
    update((d) => ({
      ...d,
      sessions,
      rpg,
      timer: d.timer
        ? {
            ...d.timer,
            phase: d.timer.phase === 'focus' ? 'break' : 'focus',
            accumulated: overshoot,
            startedAt: phaseEnd,
          }
        : null,
    }));
    return reward;
  }, [update]);

  const buyTitle = useCallback((id: string): boolean => {
    const rpg = dataRef.current.rpg;
    const title = TITLES.find((t) => t.id === id);
    if (!title || title.source !== 'shop' || rpg.titles.includes(id) || rpg.gold < title.cost) return false;
    update((d) => ({
      ...d,
      rpg: { ...d.rpg, gold: d.rpg.gold - title.cost, titles: [...d.rpg.titles, id], title: id },
    }));
    return true;
  }, [update]);

  const equipTitle = useCallback((id: string) => {
    update((d) => (d.rpg.titles.includes(id) ? { ...d, rpg: { ...d.rpg, title: id } } : d));
  }, [update]);

  const buyItem = useCallback((id: string): boolean => {
    const rpg = dataRef.current.rpg;
    const item = ITEMS.find((i) => i.id === id);
    if (!item || rpg.items.includes(id) || rpg.gold < item.cost) return false;
    update((d) => ({
      ...d,
      rpg: { ...d.rpg, gold: d.rpg.gold - item.cost, items: [...d.rpg.items, id], item: id },
    }));
    return true;
  }, [update]);

  const equipItem = useCallback((id: string) => {
    update((d) => (d.rpg.items.includes(id) ? { ...d, rpg: { ...d.rpg, item: id } } : d));
  }, [update]);

  const setTimerMode = useCallback((mode: TimerMode) => {
    update((d) => ({
      ...d,
      timer: {
        subjectId: d.timer?.subjectId ?? d.subjects[0]?.id ?? '',
        mode,
        startedAt: null,
        accumulated: 0,
        phase: 'focus',
        focusMin: d.timer?.focusMin ?? 25,
        breakMin: d.timer?.breakMin ?? 5,
      },
    }));
  }, [update]);

  const setPomodoroLength = useCallback((focusMin: number, breakMin: number) => {
    update((d) => ({
      ...d,
      timer: d.timer ? { ...d.timer, focusMin, breakMin, startedAt: null, accumulated: 0, phase: 'focus' } : null,
    }));
  }, [update]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    update((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, [update]);

  const importData = useCallback((incoming: AppData) => {
    const base = createDefaultData();
    setData({
      version: base.version,
      subjects: Array.isArray(incoming.subjects) && incoming.subjects.length ? incoming.subjects : base.subjects,
      ddays: Array.isArray(incoming.ddays) ? incoming.ddays : base.ddays,
      sessions: Array.isArray(incoming.sessions) ? incoming.sessions : [],
      days: incoming.days && typeof incoming.days === 'object' ? incoming.days : {},
      settings: { ...base.settings, ...(incoming.settings ?? {}) },
      timer: null,
      rpg: normalizeRpg(incoming.rpg),
      migrations: Array.isArray(incoming.migrations) ? incoming.migrations : [],
    });
  }, []);

  const resetAll = useCallback(() => {
    setData(createDefaultData());
  }, []);

  const fillSampleDay = useCallback((): string => {
    const current = dataRef.current;
    const sample = buildSampleDay(current);
    update((d) => ({
      ...d,
      // 같은 버튼을 다시 눌러도 예시 기록이 겹치지 않게, 그 날짜의 세션은 지우고 새로 넣는다.
      sessions: [...d.sessions.filter((s) => plannerDayKey(s.start) !== sample.date), ...sample.sessions],
      days: { ...d.days, [sample.date]: { ...ensureDay(d.days, sample.date), ...sample.day } },
    }));
    return sample.date;
  }, [update]);

  const value = useMemo<Store>(
    () => ({
      data,
      subjects: data.subjects,
      subjectById,
      dayOf,
      addSubject,
      updateSubject,
      deleteSubject,
      addDDay,
      updateDDay,
      deleteDDay,
      setMemo,
      addTask,
      cycleTask,
      deleteTask,
      setMark,
      deleteSession,
      resetSessions,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      saveTimer,
      advancePomodoro,
      buyTitle,
      equipTitle,
      buyItem,
      equipItem,
      setTimerMode,
      setPomodoroLength,
      updateSettings,
      importData,
      resetAll,
      fillSampleDay,
    }),
    [
      data,
      subjectById,
      dayOf,
      addSubject,
      updateSubject,
      deleteSubject,
      addDDay,
      updateDDay,
      deleteDDay,
      setMemo,
      addTask,
      cycleTask,
      deleteTask,
      setMark,
      deleteSession,
      resetSessions,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      saveTimer,
      advancePomodoro,
      buyTitle,
      equipTitle,
      buyItem,
      equipItem,
      setTimerMode,
      setPomodoroLength,
      updateSettings,
      importData,
      resetAll,
      fillSampleDay,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
