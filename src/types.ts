export type Subject = {
  id: string;
  name: string;
  color: string;
};

export type DDay = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
};

export type Session = {
  id: string;
  subjectId: string;
  start: number; // epoch ms
  end: number; // epoch ms
};

export type TaskStatus = 'todo' | 'doing' | 'done' | 'carry';

export type Task = {
  id: string;
  subjectId: string;
  text: string;
  status: TaskStatus;
};

export type DayData = {
  tasks: Task[];
  memo: string;
  /** `${row}-${cell}` -> subjectId, or '' for a manually erased slot */
  marks: Record<string, string>;
};

export type ThemeSetting = 'light' | 'dark' | 'system';

export type Settings = {
  theme: ThemeSetting;
  wakeLock: boolean;
  autoCarry: boolean;
};

export type TimerMode = 'stopwatch' | 'pomodoro';
export type TimerPhase = 'focus' | 'break';

export type TimerState = {
  subjectId: string;
  mode: TimerMode;
  /** epoch ms of the moment the current running stretch began; null when paused */
  startedAt: number | null;
  /** ms already elapsed before the current running stretch (in this phase) */
  accumulated: number;
  phase: TimerPhase;
  focusMin: number;
  breakMin: number;
};

export type AppData = {
  version: number;
  subjects: Subject[];
  ddays: DDay[];
  sessions: Session[];
  days: Record<string, DayData>;
  settings: Settings;
  timer: TimerState | null;
};

export type Tab = 'timer' | 'planner' | 'stats' | 'settings';
