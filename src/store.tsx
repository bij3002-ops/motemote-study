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
import type { AppData, DDay, DayData, Session, Settings, Subject, Task, TaskStatus, TimerMode } from './types';
import { addDays, plannerDayKey, uid } from './lib/date';
import { buildSampleDay, createDefaultData, emptyDay, loadData, saveData } from './lib/storage';

const STATUS_CYCLE: TaskStatus[] = ['todo', 'doing', 'done', 'carry'];

export type Store = {
  data: AppData;
  subjects: Subject[];
  subjectById: (id: string) => Subject | undefined;
  dayOf: (date: string) => DayData;
  addSubject: (name: string, color: string) => void;
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
  startTimer: (subjectId: string, mode: TimerMode) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  saveTimer: () => Session | null;
  advancePomodoro: () => boolean;
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

  const addSubject = useCallback((name: string, color: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    update((d) => ({ ...d, subjects: [...d.subjects, { id: uid('sub'), name: trimmed, color }] }));
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

  const saveTimer = useCallback((): Session | null => {
    const current = dataRef.current;
    const timer = current.timer;
    if (!timer) return null;
    const elapsed = timer.accumulated + (timer.startedAt ? Date.now() - timer.startedAt : 0);
    const shouldSave = timer.mode === 'stopwatch' ? elapsed >= 60000 : timer.phase === 'focus' && elapsed >= 60000;
    let session: Session | null = null;
    if (shouldSave) {
      const end = Date.now();
      session = { id: uid('ses'), subjectId: timer.subjectId, start: end - elapsed, end };
    }
    update((d) => ({
      ...d,
      sessions: session ? [...d.sessions, session] : d.sessions,
      timer: d.timer ? { ...d.timer, startedAt: null, accumulated: 0, phase: 'focus' } : null,
    }));
    return session;
  }, [update]);

  /** 뽀모도로 한 단계(집중/휴식)가 끝났을 때 호출. 진행되었으면 true */
  const advancePomodoro = useCallback((): boolean => {
    const current = dataRef.current;
    const timer = current.timer;
    if (!timer || timer.mode !== 'pomodoro' || timer.startedAt === null) return false;
    const now = Date.now();
    const elapsed = timer.accumulated + (now - timer.startedAt);
    const phaseMs = (timer.phase === 'focus' ? timer.focusMin : timer.breakMin) * 60000;
    if (elapsed < phaseMs) return false;

    const overshoot = Math.min(elapsed - phaseMs, phaseMs);
    const phaseEnd = now - overshoot;
    let sessions = current.sessions;
    if (timer.phase === 'focus') {
      const start = phaseEnd - timer.focusMin * 60000;
      sessions = [...sessions, { id: uid('ses'), subjectId: timer.subjectId, start, end: phaseEnd }];
    }
    update((d) => ({
      ...d,
      sessions,
      timer: d.timer
        ? {
            ...d.timer,
            phase: d.timer.phase === 'focus' ? 'break' : 'focus',
            accumulated: overshoot,
            startedAt: phaseEnd,
          }
        : null,
    }));
    return true;
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
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      saveTimer,
      advancePomodoro,
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
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      saveTimer,
      advancePomodoro,
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
