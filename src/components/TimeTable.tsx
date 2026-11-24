import { useEffect, useMemo, useRef, useState } from 'react';
import { useNow } from '../hooks/useNow';
import {
  CELLS,
  ROWS,
  hourLabel,
  parseSlotKey,
  plannerDayEnd,
  plannerDayStart,
  slotKey,
  todayKey,
} from '../lib/date';
import { mergeSlots, sessionSlots } from '../lib/stats';
import type { Session, Subject } from '../types';

const ROW_H = 36;

type Props = {
  date: string;
  sessions: Session[];
  marks: Record<string, string>;
  subjects: Subject[];
  onMark: (key: string, subjectId: string) => void;
};

function rangeKeys(a: string, b: string): string[] {
  const pa = parseSlotKey(a);
  const pb = parseSlotKey(b);
  if (!pa || !pb || pa.row !== pb.row) return [b];
  const lo = Math.min(pa.cell, pb.cell);
  const hi = Math.max(pa.cell, pb.cell);
  return Array.from({ length: hi - lo + 1 }, (_, i) => slotKey(pa.row, lo + i));
}

export default function TimeTable({ date, sessions, marks, subjects, onMark }: Props) {
  const isToday = date === todayKey();
  const now = useNow(30000, true);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const didScroll = useRef(false);

  const [brush, setBrush] = useState<string>(subjects[0]?.id ?? '');
  const gesture = useRef<{
    startKey: string;
    lastKey: string;
    startX: number;
    startY: number;
    painting: boolean;
    moved: boolean;
  } | null>(null);

  const filled = useMemo(() => {
    const auto = sessionSlots(date, sessions);
    return mergeSlots(auto, marks ?? {});
  }, [date, sessions, marks]);

  const colorOf = (subjectId: string) => subjects.find((s) => s.id === subjectId)?.color ?? '#8D8D99';
  const colorName = (subjectId: string) => subjects.find((s) => s.id === subjectId)?.name ?? '기록';

  // 오늘이면 지금 시간대가 보이도록 스크롤
  useEffect(() => {
    if (didScroll.current || !isToday || !scrollRef.current) return;
    const offset = ((now - plannerDayStart(date)) / 3600000) * ROW_H - 120;
    if (offset > 0) scrollRef.current.scrollTop = offset;
    didScroll.current = true;
  }, [isToday, now, date]);

  useEffect(() => {
    // 과목 목록이 바뀌어 선택한 과목이 사라졌을 때만 첫 과목으로 되돌린다.
    // ('erase'는 과목이 아니라 지우개라 여기서 걸러야 한다)
    if (brush === 'erase') return;
    if (subjects.length > 0 && !subjects.some((s) => s.id === brush)) {
      setBrush(subjects[0].id);
    }
  }, [subjects, brush]);

  const paint = (keys: string[]) => {
    keys.forEach((k) => onMark(k, brush === 'erase' ? '' : brush));
  };

  const keyAt = (x: number, y: number): string | null => {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = el?.closest('[data-slot]') as HTMLElement | null;
    return cell?.dataset.slot ?? null;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const key = keyAt(e.clientX, e.clientY);
    if (!key) return;
    gesture.current = {
      startKey: key,
      lastKey: key,
      startX: e.clientX,
      startY: e.clientY,
      painting: false,
      moved: false,
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (!g.painting) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        g.painting = true;
        paint([g.startKey]);
      } else if (Math.abs(dy) > 10) {
        g.moved = true; // 세로로 움직이면 스크롤로 본다
        return;
      } else {
        return;
      }
    }

    const key = keyAt(e.clientX, e.clientY);
    if (!key || key === g.lastKey) return;
    paint(rangeKeys(g.lastKey, key));
    g.lastKey = key;
  };

  const endGesture = () => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    if (!g.painting && !g.moved) paint([g.startKey]);
  };

  const nowOffset = ((now - plannerDayStart(date)) / 3600000) * ROW_H;
  const showNow = isToday && now >= plannerDayStart(date) && now < plannerDayEnd(date);

  return (
    <section className="card tt-card">
      <div className="tt-toolbar">
        <div className="grow">
          <div className="chip-row" style={{ paddingBottom: 0 }}>
            {subjects.map((s) => (
              <button
                key={s.id}
                className="chip"
                aria-pressed={brush === s.id}
                style={{ ['--chip-color' as string]: s.color, height: 30, fontSize: 12 }}
                onClick={() => setBrush(s.id)}
              >
                <span className="dot" style={{ background: s.color }} />
                {s.name}
              </button>
            ))}
            <button
              className="chip"
              aria-pressed={brush === 'erase'}
              style={{ height: 30, fontSize: 12 }}
              onClick={() => setBrush('erase')}
            >
              <span className="dot" style={{ background: 'var(--ink-3)' }} />
              지우개
            </button>
          </div>
        </div>
      </div>

      <div className="tt-scroll" ref={scrollRef}>
        <div
          className="tt-grid"
          role="grid"
          aria-label="10분 타임테이블"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endGesture}
          onPointerCancel={() => {
            gesture.current = null;
          }}
        >
          {Array.from({ length: ROWS }, (_, row) => (
            <div className="tt-row" role="row" key={`row-${row}`}>
              <div className="tt-hour num" role="rowheader" aria-label={`${hourLabel(row)}시`}>
                {hourLabel(row)}
              </div>
              {Array.from({ length: CELLS }, (_, cell) => {
                const key = slotKey(row, cell);
                const subjectId = filled[key];
                const endMinutes = (row * CELLS + cell) * 10 + 10;
                const slotStart = `${hourLabel(row)}:${String(cell * 10).padStart(2, '0')}`;
                const slotEnd = `${hourLabel(Math.floor(endMinutes / 60))}:${String(endMinutes % 60).padStart(2, '0')}`;
                const label = `${slotStart}~${slotEnd} ${subjectId ? colorName(subjectId) : '비어 있음'}`;
                return (
                  <div
                    key={key}
                    role="gridcell"
                    aria-label={label}
                    data-slot={key}
                    className={`tt-cell${subjectId ? ' filled' : ''}`}
                    style={
                      subjectId
                        ? {
                            ['--cell-color' as string]: colorOf(subjectId),
                            backgroundColor: colorOf(subjectId),
                            opacity: 0.92,
                          }
                        : undefined
                    }
                  />
                );
              })}
            </div>
          ))}
          {showNow && <div className="tt-now" style={{ top: nowOffset }} />}
        </div>
      </div>

      <div className="tt-legend">
        <span className="muted">10분 칸을 톡 누르거나 옆으로 드래그하면 색칠돼요</span>
      </div>
    </section>
  );
}
