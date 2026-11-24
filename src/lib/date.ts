/** 플래너 한 줄(하루)은 새벽 05:00 에 시작해 다음날 04:59 에 끝난다. */
export const DAY_START_HOUR = 5;
export const ROWS = 24;
export const CELLS = 6;
export const CELL_MINUTES = 10;

export const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function addDays(key: string, delta: number): string {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + delta);
  return dateKey(d);
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function diffDays(fromKey: string, toKey: string): number {
  const a = parseDateKey(fromKey).getTime();
  const b = parseDateKey(toKey).getTime();
  return Math.round((b - a) / 86400000);
}

/** 어떤 시각이 속한 '플래너 하루' (새벽 5시 기준). */
export function plannerDayKey(ms: number): string {
  return dateKey(new Date(ms - DAY_START_HOUR * 3600000));
}

/** 플래너 하루의 시작 시각(그날 05:00) epoch ms. */
export function plannerDayStart(key: string): number {
  const d = parseDateKey(key);
  d.setHours(DAY_START_HOUR, 0, 0, 0);
  return d.getTime();
}

export function plannerDayEnd(key: string): number {
  return plannerDayStart(key) + 24 * 3600000;
}

export function hourLabel(row: number): string {
  return pad2((DAY_START_HOUR + row) % 24);
}

export function rowOfHour(hour: number): number {
  return (hour - DAY_START_HOUR + 24) % 24;
}

export function slotKey(row: number, cell: number): string {
  return `${row}-${cell}`;
}

export function parseSlotKey(key: string): { row: number; cell: number } | null {
  const [r, c] = key.split('-').map(Number);
  if (!Number.isFinite(r) || !Number.isFinite(c)) return null;
  return { row: r, cell: c };
}

export function slotStartMs(dayKey: string, row: number, cell: number): number {
  return plannerDayStart(dayKey) + row * 3600000 + cell * CELL_MINUTES * 60000;
}

export function formatKoreanDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY_KO[d.getDay()]})`;
}

export function formatDotDate(key: string): string {
  const d = parseDateKey(key);
  return `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())}`;
}

export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** 00:12:34 형태 (스톱워치) */
export function clockHMS(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}

/** 12:34 형태 (뽀모도로) */
export function clockMMSS(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${pad2(m)}:${pad2(s)}`;
}

export function durationText(ms: number): string {
  const totalMin = Math.round(ms / 60000);
  if (totalMin < 60) return `${totalMin}분`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

export function minutesText(min: number): string {
  const total = Math.round(min);
  if (total < 60) return `${total}분`;
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
}

export function weekStartKey(key: string): string {
  const d = parseDateKey(key);
  const day = d.getDay(); // 0=일
  const offset = day === 0 ? -6 : 1 - day; // 월요일 시작
  d.setDate(d.getDate() + offset);
  return dateKey(d);
}

export function weekKeys(key: string): string[] {
  const start = weekStartKey(key);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function monthPrefix(key: string): string {
  return key.slice(0, 7);
}

export function daysInMonth(key: string): string[] {
  const d = parseDateKey(key);
  const year = d.getFullYear();
  const month = d.getMonth();
  const last = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: last }, (_, i) => `${year}-${pad2(month + 1)}-${pad2(i + 1)}`);
}

export function weekdayShort(key: string): string {
  return WEEKDAY_KO[parseDateKey(key).getDay()];
}

export function monthLabel(key: string): string {
  const d = parseDateKey(key);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
