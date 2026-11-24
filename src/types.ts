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

export type RpgState = {
  level: number;
  xp: number;
  gold: number;
  /** 1부터 시작하는 전체 스테이지 번호 (5단계 이후 Lv.2·Lv.3로 순환) */
  stage: number;
  /** 현재 몬스터의 남은 HP */
  hp: number;
  /** 기본 몬스터 id -> 처치 횟수 */
  kills: Record<string, number>;
  /** 전리품 id -> 획득 개수 */
  loot: Record<string, number>;
  /** 보유 칭호 id */
  titles: string[];
  /** 장착한 칭호 id */
  title: string | null;
  /** 보유 장비 id */
  items: string[];
  /** 장착한 장비 id */
  item: string | null;
  /** 50분+ 크리티컬 배지 id -> 획득 횟수 */
  badges: Record<string, number>;
  /** 25분+ 보너스 상자 개수 */
  boxes: number;
  totalMinutes: number;
  totalDamage: number;
  /** 한 번에 가장 오래 집중한 분 */
  bestSession: number;
  streak: number;
  lastStudyDay: string | null;
};

export type RpgKill = {
  id: string;
  label: string;
  emoji: string;
  gold: number;
  loot: string;
  /** 이번 처치로 새로 얻은 칭호 이름 */
  newTitle?: string;
};

export type RpgTier = 'plain' | 'focus' | 'critical';

export type RpgReward = {
  minutes: number;
  tier: RpgTier;
  damage: number;
  xpGained: number;
  goldGained: number;
  levelsGained: number;
  level: number;
  boxes: number;
  badges: string[];
  hpBefore: number;
  monsterHpBefore: number;
  hpAfter: number;
  monsterMaxAfter: number;
  monsterLabel: string;
  monsterEmoji: string;
  kills: RpgKill[];
};

export type ThemeSetting = 'light' | 'dark' | 'system';

export type Settings = {
  theme: ThemeSetting;
  wakeLock: boolean;
  autoCarry: boolean;
  /** 타이머를 재는 동안 화면 전체를 흑백으로 (도파민 자극 줄이기) */
  focusGrayscale: boolean;
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
  rpg: RpgState;
  /** 이미 적용한 데이터 마이그레이션 표시 */
  migrations: string[];
};

export type Tab = 'timer' | 'planner' | 'rpg' | 'stats' | 'settings';
