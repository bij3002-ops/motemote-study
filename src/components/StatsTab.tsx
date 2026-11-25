import { useMemo, useState } from 'react';
import {
  addDays,
  daysInMonth,
  formatKoreanDate,
  minutesText,
  monthLabel,
  monthPrefix,
  parseDateKey,
  todayKey,
  weekKeys,
  weekdayShort,
} from '../lib/date';
import { monthMinutes, sessionMinutesByDay, subjectMinutes, sumMinutes, weekMinutes } from '../lib/stats';
import { useStore } from '../store';
import SessionLogCard from './SessionLogCard';

function level(minutes: number): string {
  if (minutes <= 0) return '';
  if (minutes < 30) return 'lv1';
  if (minutes < 60) return 'lv2';
  if (minutes < 150) return 'lv3';
  return 'lv4';
}

export default function StatsTab() {
  const { data, subjects } = useStore();
  const today = todayKey();
  const [monthAnchor, setMonthAnchor] = useState<string>(today);
  const [logDate, setLogDate] = useState<string>(today);

  const minutesMap = useMemo(() => sessionMinutesByDay(data.sessions), [data.sessions]);

  const todayMin = minutesMap.get(today) ?? 0;
  const weekMin = weekMinutes(minutesMap, today);
  const monthMin = monthMinutes(minutesMap, today);

  const week = weekKeys(today);
  const weekData = week.map((key) => ({
    key,
    minutes: minutesMap.get(key) ?? 0,
    label: weekdayShort(key),
    isToday: key === today,
  }));
  const weekMax = Math.max(60, ...weekData.map((d) => d.minutes));

  const prefix = monthPrefix(monthAnchor);
  const monthDays = daysInMonth(monthAnchor);
  const subjectTotals = useMemo(
    () => subjectMinutes(data.sessions, `${prefix}-01`, `${prefix}-31`),
    [data.sessions, prefix],
  );
  const subjectTotalSum = [...subjectTotals.values()].reduce((a, b) => a + b, 0);

  const sortedSubjects = [...subjectTotals.entries()]
    .map(([id, minutes]) => ({ subject: subjects.find((s) => s.id === id), minutes }))
    .filter((row) => row.subject)
    .sort((a, b) => b.minutes - a.minutes);

  const leading = parseDateKey(monthDays[0]).getDay();

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">{formatKoreanDate(today)}</p>
          <h1 className="title">통계</h1>
        </div>
      </header>

      <div className="stat-grid">
        <div className="stat-box">
          <div className="k">오늘</div>
          <div className="v num">
            {Math.round(todayMin / 60) >= 1 ? (
              <>
                {Math.floor(todayMin / 60)}
                <small>시간</small> {Math.round(todayMin % 60)}
                <small>분</small>
              </>
            ) : (
              <>
                {Math.round(todayMin)}
                <small>분</small>
              </>
            )}
          </div>
        </div>
        <div className="stat-box">
          <div className="k">이번 주</div>
          <div className="v num">{minutesText(weekMin)}</div>
        </div>
        <div className="stat-box">
          <div className="k">이번 달</div>
          <div className="v num">{minutesText(monthMin)}</div>
        </div>
      </div>

      <SessionLogCard
        date={logDate}
        headRight={
          <span className="row" style={{ gap: 4, alignItems: 'center' }}>
            <button
              className="icon-btn"
              style={{ width: 24, height: 24, borderRadius: 8 }}
              onClick={() => setLogDate(addDays(logDate, -1))}
              aria-label="기록 이전 날짜"
            >
              ‹
            </button>
            <button
              className="hint num"
              style={{ minWidth: 62, textAlign: 'center', color: logDate === today ? 'var(--ink)' : undefined }}
              onClick={() => setLogDate(today)}
              aria-label="오늘 기록 보기"
            >
              {logDate === today ? '오늘' : logDate.slice(5).replace('-', '.')}
            </button>
            <button
              className="icon-btn"
              style={{ width: 24, height: 24, borderRadius: 8 }}
              onClick={() => setLogDate(addDays(logDate, 1))}
              aria-label="기록 다음 날짜"
            >
              ›
            </button>
          </span>
        }
      />

      <div className="section-title">
        <h2>최근 7일</h2>
        <span className="hint num">합계 {minutesText(weekData.reduce((a, b) => a + b.minutes, 0))}</span>
      </div>

      <div className="card">
        <div className="bars">
          {weekData.map((d) => (
            <div className="bar-col" key={d.key}>
              <span className="val">{d.minutes > 0 ? Math.round(d.minutes) : ''}</span>
              <div
                className={`bar${d.minutes === 0 ? ' zero' : ''}`}
                style={{
                  height: `${Math.max(3, (d.minutes / weekMax) * 84)}px`,
                  background: d.isToday && d.minutes > 0 ? 'var(--danger)' : undefined,
                }}
              />
              <span className="cap" style={d.isToday ? { color: 'var(--ink)', fontWeight: 800 } : undefined}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="section-title">
        <h2>과목별 비율</h2>
        <span className="hint">{monthLabel(monthAnchor).replace('년 ', '. ')}</span>
      </div>

      <div className="card">
        {subjectTotalSum === 0 ? (
          <div className="empty" style={{ padding: '10px 0' }}>
            이번 달 기록이 아직 없어요
          </div>
        ) : (
          <>
            <div className="ratio-bar">
              {sortedSubjects.map((row) => (
                <div
                  key={row.subject?.id}
                  style={{
                    width: `${(row.minutes / subjectTotalSum) * 100}%`,
                    background: row.subject?.color,
                  }}
                />
              ))}
            </div>
            <div className="legend-list">
              {sortedSubjects.map((row) => (
                <div className="legend-row" key={row.subject?.id}>
                  <i style={{ background: row.subject?.color }} />
                  <span className="nm">{row.subject?.name}</span>
                  <span className="vl num">{minutesText(row.minutes)}</span>
                  <span className="pc num">{Math.round((row.minutes / subjectTotalSum) * 100)}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="section-title">
        <h2>월간 히트맵</h2>
        <div className="row" style={{ gap: 6 }}>
          <button
            className="icon-btn"
            style={{ width: 26, height: 26, borderRadius: 9 }}
            onClick={() => setMonthAnchor(addDays(`${prefix}-01`, -1))}
            aria-label="이전 달"
          >
            ‹
          </button>
          <span className="hint num">{monthLabel(monthAnchor)}</span>
          <button
            className="icon-btn"
            style={{ width: 26, height: 26, borderRadius: 9 }}
            onClick={() => setMonthAnchor(addDays(`${prefix}-28`, 7))}
            aria-label="다음 달"
          >
            ›
          </button>
        </div>
      </div>

      <div className="card">
        <div className="heat-weekday">
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="heatmap">
          {Array.from({ length: leading }, (_, i) => (
            <div key={`blank-${i}`} />
          ))}
          {monthDays.map((key) => {
            const minutes = minutesMap.get(key) ?? 0;
            return (
              <div
                key={key}
                className={`heat-cell ${level(minutes)}${key === today ? ' today' : ''}`}
                title={`${key} · ${minutesText(minutes)}`}
              >
                {parseDateKey(key).getDate()}
              </div>
            );
          })}
        </div>
        <div className="tt-legend" style={{ justifyContent: 'flex-end' }}>
          <span>적음</span>
          <span className="row" style={{ gap: 3 }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: 'var(--paper-2)', display: 'inline-block' }} />
            <i className="heat-cell lv1" style={{ width: 10, height: 10, borderRadius: 3 }} />
            <i className="heat-cell lv2" style={{ width: 10, height: 10, borderRadius: 3 }} />
            <i className="heat-cell lv3" style={{ width: 10, height: 10, borderRadius: 3 }} />
            <i className="heat-cell lv4" style={{ width: 10, height: 10, borderRadius: 3 }} />
          </span>
          <span>많음</span>
        </div>
      </div>
    </main>
  );
}
