import { useEffect, useMemo, useRef, useState } from 'react';
import { useNow } from '../hooks/useNow';
import { useToast } from '../hooks/useToast';
import { useWakeLock, wakeLockSupported } from '../hooks/useWakeLock';
import {
  clockHMS,
  clockMMSS,
  durationText,
  formatKoreanDate,
  formatTime,
  minutesText,
  plannerDayKey,
  todayKey,
} from '../lib/date';
import { sessionMinutesByDay } from '../lib/stats';
import { useStore } from '../store';
import type { TimerMode } from '../types';
import DDayStrip from './DDayStrip';

const PRESETS: Array<{ label: string; focus: number; brk: number }> = [
  { label: '25 / 5', focus: 25, brk: 5 },
  { label: '50 / 10', focus: 50, brk: 10 },
  { label: '15 / 3', focus: 15, brk: 3 },
];

function beep(): void {
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.value = 0.06;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    window.setTimeout(() => {
      osc.stop();
      void ctx.close();
    }, 240);
  } catch {
    /* 소리는 없어도 괜찮다 */
  }
}

export default function TimerTab() {
  const store = useStore();
  const { data, subjects, subjectById, startTimer, pauseTimer, resumeTimer, saveTimer } = store;
  const timer = data.timer;
  const running = !!timer && timer.startedAt !== null;
  const now = useNow(200, running);
  const [toast, showToast] = useToast();

  const mode: TimerMode = timer?.mode ?? 'stopwatch';
  const [subjectId, setSubjectId] = useState<string>(timer?.subjectId ?? subjects[0]?.id ?? '');

  useEffect(() => {
    if (timer?.subjectId) setSubjectId(timer.subjectId);
  }, [timer?.subjectId]);

  const elapsed = timer ? timer.accumulated + (timer.startedAt ? Math.max(0, now - timer.startedAt) : 0) : 0;
  const phaseMs = timer ? (timer.phase === 'focus' ? timer.focusMin : timer.breakMin) * 60000 : 0;

  useWakeLock(data.settings.wakeLock && running);

  // 뽀모도로 단계 전환
  const phaseRef = useRef<string>('');
  useEffect(() => {
    if (!timer || timer.mode !== 'pomodoro' || timer.startedAt === null) return;
    if (elapsed < phaseMs) return;
    const before = timer.phase;
    const advanced = store.advancePomodoro();
    if (advanced && phaseRef.current !== before) {
      phaseRef.current = before;
      beep();
      showToast(before === 'focus' ? '집중 완료! 휴식으로 전환했어요' : '휴식 끝! 다시 집중해 볼까요');
    }
  }, [elapsed, phaseMs, timer, store, showToast]);

  const today = todayKey();
  const minutesMap = useMemo(() => sessionMinutesByDay(data.sessions), [data.sessions]);
  const todayMinutes = minutesMap.get(today) ?? 0;

  const todaySessions = useMemo(
    () =>
      data.sessions
        .filter((s) => plannerDayKey(s.start) === today)
        .sort((a, b) => b.start - a.start)
        .slice(0, 8),
    [data.sessions, today],
  );

  const activeSubject = subjectById(subjectId) ?? subjects[0];
  const color = activeSubject?.color ?? '#FF6B6B';

  const handlePrimary = () => {
    if (!timer || timer.accumulated === 0 || timer.mode !== mode || timer.subjectId !== subjectId) {
      startTimer(subjectId, mode);
      return;
    }
    if (running) pauseTimer();
    else resumeTimer();
  };

  const handleSave = () => {
    const session = saveTimer();
    if (session) {
      const name = subjectById(session.subjectId)?.name ?? '공부';
      showToast(`${name} ${durationText(session.end - session.start)} 저장 · 플래너에 기록됐어요`);
    } else {
      showToast('1분 이상 기록하면 저장돼요');
    }
  };

  const remaining = Math.max(0, phaseMs - elapsed);
  const progress = phaseMs > 0 ? Math.min(1, elapsed / phaseMs) : 0;
  const startedAtMs = timer && elapsed > 0 ? now - elapsed : null;

  return (
    <main className="screen">
      {toast}
      <header className="topbar">
        <div>
          <p className="eyebrow">오늘 · {formatKoreanDate(today)}</p>
          <h1 className="title">타이머</h1>
        </div>
        <div className="topbar-right">
          <span className="pill num">오늘 {minutesText(todayMinutes)}</span>
        </div>
      </header>

      <DDayStrip limit={2} />

      <section className="card timer-card">
        <div className="timer-head">
          <div className="seg" style={{ flex: 1 }}>
            <button aria-pressed={mode === 'stopwatch'} onClick={() => store.setTimerMode('stopwatch')}>
              스톱워치
            </button>
            <button aria-pressed={mode === 'pomodoro'} onClick={() => store.setTimerMode('pomodoro')}>
              뽀모도로
            </button>
          </div>
        </div>

        <div className={`timer-display num${mode === 'pomodoro' ? ' pomo' : ''}`}>
          {mode === 'pomodoro' ? clockMMSS(remaining) : clockHMS(elapsed)}
        </div>

        <div className="timer-meta">
          <span className="dot" style={{ background: color }} />
          <span>{activeSubject?.name ?? '과목 없음'}</span>
          {mode === 'pomodoro' && (
            <>
              <span className="muted">·</span>
              <span className="muted">{timer?.phase === 'break' ? '휴식' : '집중'}</span>
            </>
          )}
          {startedAtMs && (
            <>
              <span className="muted">·</span>
              <span className="muted num">{formatTime(startedAtMs)} 시작</span>
            </>
          )}
        </div>

        {mode === 'pomodoro' && (
          <>
            <div className="phase-bar">
              <div style={{ width: `${progress * 100}%`, background: timer?.phase === 'break' ? '#2EC4B6' : color }} />
            </div>
            <div className="pomo-presets">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  aria-pressed={timer?.focusMin === p.focus && timer?.breakMin === p.brk}
                  onClick={() => {
                    if (running) {
                      showToast('타이머를 멈추고 바꿔 주세요');
                      return;
                    }
                    store.setTimerMode('pomodoro');
                    store.setPomodoroLength(p.focus, p.brk);
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </>
        )}

        <div className="timer-actions">
          <button className="btn btn-primary" onClick={handlePrimary}>
            {running ? '일시정지' : elapsed > 0 ? '이어서' : '시작'}
          </button>
          <button className="btn btn-ghost" onClick={handleSave} disabled={elapsed === 0 && !running}>
            저장
          </button>
        </div>
      </section>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        <div className="chip-row" style={{ padding: '12px 12px 10px' }}>
          {subjects.map((s) => (
            <button
              key={s.id}
              className="chip"
              aria-pressed={s.id === subjectId}
              style={{ ['--chip-color' as string]: s.color }}
              onClick={() => setSubjectId(s.id)}
            >
              <span className="dot" style={{ background: s.color }} />
              {s.name}
            </button>
          ))}
        </div>
      </div>

      <div className="card-flat">
        <div className="toggle-row">
          <div>
            <div className="label">화면 켜짐 유지</div>
            <div className="sub">
              {wakeLockSupported()
                ? '타이머가 도는 동안 화면이 꺼지지 않아요'
                : '이 브라우저는 지원하지 않아요 (iOS 16.4 이상)'}
            </div>
          </div>
          <button
            className="switch"
            aria-pressed={data.settings.wakeLock}
            aria-label="화면 켜짐 유지"
            onClick={() => store.updateSettings({ wakeLock: !data.settings.wakeLock })}
          />
        </div>
      </div>

      <div className="section-title">
        <h2>오늘 기록</h2>
        <span className="hint num">{todaySessions.length > 0 ? `${todaySessions.length}개` : ''}</span>
      </div>

      <div className="card-flat">
        {todaySessions.length === 0 ? (
          <div className="empty">
            아직 기록이 없어요.
            <br />
            과목을 고르고 타이머를 시작해 보세요.
          </div>
        ) : (
          <div className="log-list">
            {todaySessions.map((s) => {
              const subject = subjectById(s.subjectId);
              return (
                <div className="log-item" key={s.id}>
                  <span className="bar" style={{ background: subject?.color ?? '#8D8D99' }} />
                  <span className="name">{subject?.name ?? '삭제된 과목'}</span>
                  <span className="time num">
                    {formatTime(s.start)}–{formatTime(s.end)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
