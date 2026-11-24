import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addDays,
  formatDotDate,
  formatKoreanDate,
  plannerDayKey,
  todayKey,
  WEEKDAY_KO,
  parseDateKey,
} from '../lib/date';
import { useStore } from '../store';
import DDayStrip from './DDayStrip';
import TaskManager from './TaskManager';
import TimeTable from './TimeTable';

const MemoTimeTable = memo(TimeTable);

export default function PlannerTab() {
  const { data, subjects, dayOf, setMemo, setMark } = useStore();
  const [date, setDate] = useState<string>(todayKey());
  const day = dayOf(date);
  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const [memo, setMemoLocal] = useState(day.memo ?? '');
  const commitRef = useRef<number | null>(null);

  useEffect(() => {
    setMemoLocal(day.memo ?? '');
  }, [date, day.memo]);

  const commitMemo = useCallback(
    (value: string) => {
      if (commitRef.current) window.clearTimeout(commitRef.current);
      commitRef.current = window.setTimeout(() => setMemo(date, value), 250);
    },
    [date, setMemo],
  );

  useEffect(() => {
    return () => {
      if (commitRef.current) window.clearTimeout(commitRef.current);
    };
  }, []);

  const sessions = useMemo(
    () => data.sessions.filter((s) => plannerDayKey(s.start) === date),
    [data.sessions, date],
  );

  const marks = useMemo(() => day.marks ?? {}, [day.marks]);

  const handleMark = useCallback(
    (key: string, subjectId: string) => {
      setMark(date, key, subjectId);
    },
    [date, setMark],
  );

  const weekday = WEEKDAY_KO[parseDateKey(date).getDay()];
  const isToday = date === todayKey();

  return (
    <main className="screen">
      <header className="date-nav">
        <button className="icon-btn" onClick={() => setDate(addDays(date, -1))} aria-label="이전 날짜">
          ‹
        </button>
        <button
          className="date-label"
          onClick={() => {
            const el = dateInputRef.current;
            if (!el) return;
            if (typeof el.showPicker === 'function') el.showPicker();
            else el.click();
          }}
          aria-label="날짜 선택"
        >
          <span className="d1 num">{formatDotDate(date)}</span>
          <span className="d2">
            {weekday}요일 {isToday ? '· 오늘' : ''}
          </span>
        </button>
        <button className="icon-btn" onClick={() => setDate(addDays(date, 1))} aria-label="다음 날짜">
          ›
        </button>
        <input
          ref={dateInputRef}
          className="hidden-date"
          type="date"
          value={date}
          onChange={(e) => {
            if (e.target.value) setDate(e.target.value);
          }}
          tabIndex={-1}
          aria-hidden="true"
        />
        <div style={{ flex: 1 }} />
        {!isToday && (
          <button className="btn btn-line btn-sm" onClick={() => setDate(todayKey())}>
            오늘
          </button>
        )}
      </header>

      <p className="eyebrow" style={{ margin: '-6px 0 -8px' }}>
        {formatKoreanDate(date)}
      </p>

      <DDayStrip limit={2} />

      <div className="card-flat memo">
        <span className="q">“</span>
        <input
          value={memo}
          placeholder="오늘의 한 줄 다짐"
          aria-label="오늘의 한 줄 다짐"
          onChange={(e) => {
            setMemoLocal(e.target.value);
            commitMemo(e.target.value);
          }}
          onBlur={() => setMemo(date, memo)}
        />
      </div>

      <TaskManager date={date} />

      <div className="section-title">
        <h2>10분 타임테이블</h2>
        <span className="hint">05:00 – 04:00</span>
      </div>

      <MemoTimeTable
        date={date}
        sessions={sessions}
        marks={marks}
        subjects={subjects}
        onMark={handleMark}
      />
    </main>
  );
}
