import type { Session } from '../types';
import {
  CELL_MINUTES,
  CELLS,
  monthPrefix,
  plannerDayEnd,
  plannerDayKey,
  plannerDayStart,
  slotKey,
  weekKeys,
} from './date';

/** 세션을 '플래너 하루'(05:00~다음날 05:00) 기준으로 쪼개 분 단위로 집계한다. */
export function sessionMinutesByDay(sessions: Session[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    let cursor = Math.min(s.start, s.end);
    const end = Math.max(s.start, s.end);
    let guard = 0;
    while (cursor < end && guard < 500) {
      guard += 1;
      const day = plannerDayKey(cursor);
      const dayEnd = plannerDayEnd(day);
      const chunkEnd = Math.min(end, dayEnd);
      const minutes = (chunkEnd - cursor) / 60000;
      map.set(day, (map.get(day) ?? 0) + minutes);
      cursor = chunkEnd;
    }
  }
  return map;
}

export function sumMinutes(map: Map<string, number>, keys: string[]): number {
  return keys.reduce((acc, k) => acc + (map.get(k) ?? 0), 0);
}

export function sumRange(map: Map<string, number>, from: string, to: string): number {
  let total = 0;
  for (const [key, value] of map) {
    if (key >= from && key <= to) total += value;
  }
  return total;
}

export function monthMinutes(map: Map<string, number>, dayKey: string): number {
  const prefix = monthPrefix(dayKey);
  let total = 0;
  for (const [key, value] of map) {
    if (key.startsWith(prefix)) total += value;
  }
  return total;
}

export function weekMinutes(map: Map<string, number>, dayKey: string): number {
  return sumMinutes(map, weekKeys(dayKey));
}

export function subjectMinutes(
  sessions: Session[],
  from: string,
  to: string,
): Map<string, number> {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const start = Math.min(s.start, s.end);
    const end = Math.max(s.start, s.end);
    let cursor = start;
    let guard = 0;
    while (cursor < end && guard < 500) {
      guard += 1;
      const day = plannerDayKey(cursor);
      const chunkEnd = Math.min(end, plannerDayEnd(day));
      if (day >= from && day <= to) {
        map.set(s.subjectId, (map.get(s.subjectId) ?? 0) + (chunkEnd - cursor) / 60000);
      }
      cursor = chunkEnd;
    }
  }
  return map;
}

/**
 * 타이머 기록으로 자동 색칠되는 10분 칸.
 * 수동 색칠/지우개(marks)가 이 위에 덮인다.
 */
export function sessionSlots(dayKey: string, sessions: Session[]): Record<string, string> {
  const out: Record<string, string> = {};
  const dayStart = plannerDayStart(dayKey);
  const dayEnd = plannerDayEnd(dayKey);
  const slotMs = CELL_MINUTES * 60000;

  for (const s of sessions) {
    const start = Math.max(Math.min(s.start, s.end), dayStart);
    const end = Math.min(Math.max(s.start, s.end), dayEnd);
    if (end <= start) continue;
    const first = Math.floor((start - dayStart) / slotMs);
    const last = Math.ceil((end - dayStart) / slotMs) - 1;
    for (let i = first; i <= last; i += 1) {
      if (i < 0 || i >= 24 * CELLS) continue;
      const row = Math.floor(i / CELLS);
      const cell = i % CELLS;
      out[slotKey(row, cell)] = s.subjectId;
    }
  }
  return out;
}

export function mergeSlots(
  auto: Record<string, string>,
  manual: Record<string, string>,
): Record<string, string> {
  const merged: Record<string, string> = { ...auto };
  for (const [key, value] of Object.entries(manual)) {
    if (value === '') delete merged[key];
    else merged[key] = value;
  }
  return merged;
}

export function dayMinutes(sessions: Session[], dayKey: string): number {
  return sessionMinutesByDay(sessions).get(dayKey) ?? 0;
}
