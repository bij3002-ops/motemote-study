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
  todayKey,
} from '../lib/date';
import { isFocusGrayOn } from '../lib/focus';
import { sessionMinutesByDay } from '../lib/stats';
import { useStore } from '../store';
import type { RpgReward, TimerMode } from '../types';
import AddSubjectChip from './AddSubjectChip';
import DDayStrip from './DDayStrip';
import MonsterMini from './MonsterMini';
import RpgResultModal from './RpgResultModal';
import SessionLogCard from './SessionLogCard';

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

export default function TimerTab({ onOpenRpg }: { onOpenRpg?: () => void }) {
  const store = useStore();
  const { data, subjects, subjectById, startTimer, pauseTimer, resumeTimer, saveTimer, resetTimer } = store;
  const timer = data.timer;
  const running = !!timer && timer.startedAt !== null;
  const focusGrayOn = isFocusGrayOn(data);
  const now = useNow(200, running);
  const [toast, showToast] = useToast();
  const [reward, setReward] = useState<RpgReward | null>(null);

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
      showToast(
        before === 'focus'
          ? `집중 완료! 몬스터에게 -${advanced.damage} HP · 휴식으로 전환`
          : '휴식 끝! 다시 집중해 볼까요',
      );
    }
  }, [elapsed, phaseMs, timer, store, showToast]);

  const today = todayKey();
  const minutesMap = useMemo(() => sessionMinutesByDay(data.sessions), [data.sessions]);
  const todayMinutes = minutesMap.get(today) ?? 0;

  const activeSubject = subjectById(subjectId) ?? subjects[0];
  const color = activeSubject?.color ?? '#FF6B6B';

  const handlePrimary = () => {
    if (running) {
      pauseTimer();
      return;
    }
    if (!timer || timer.accumulated === 0 || timer.mode !== mode || timer.subjectId !== subjectId) {
      startTimer(subjectId, mode);
      return;
    }
    resumeTimer();
  };

  const handleSave = () => {
    // 4시간 넘게 잔 걸 그대로 저장하려 하면, 켜 두고 잊은 건 아닌지 한 번 더 묻는다.
    if (mode === 'stopwatch' && elapsed >= 4 * 3600000) {
      if (
        !window.confirm(
          `${durationText(elapsed)}나 기록됐어요! 혹시 켜 두고 잊으신 건 아닌가요? 그대로 저장할까요?`,
        )
      ) {
        return;
      }
    }
    const { session, reward: gained } = saveTimer();
    if (session) {
      const name = subjectById(session.subjectId)?.name ?? '공부';
      showToast(
        `${name} ${durationText(session.end - session.start)} 저장 · 몬스터에게 -${gained?.damage ?? 0} HP`,
      );
      if (gained) setReward(gained);
    } else {
      showToast('1분 이상 기록하면 저장돼요');
    }
  };

  const handleReset = () => {
    if (!timer) return;
    if (!window.confirm('지금까지 잰 시간을 버리고 00:00으로 되돌릴까요?')) return;
    resetTimer();
    showToast('타이머를 처음으로 되돌렸어요');
  };

  const remaining = Math.max(0, phaseMs - elapsed);
  const progress = phaseMs > 0 ? Math.min(1, elapsed / phaseMs) : 0;
  const startedAtMs = timer && elapsed > 0 ? now - elapsed : null;

  return (
    <main className="screen">
      {toast}
      {reward && <RpgResultModal reward={reward} onClose={() => setReward(null)} />}
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

      <MonsterMini onOpen={onOpenRpg} />

      <section className="card timer-card">
        <div className="timer-head">
          <div className="seg" style={{ flex: 1 }}>
            <button
              aria-pressed={mode === 'stopwatch'}
              onClick={() => {
                if (running || elapsed > 0) {
                  showToast('진행 중인 기록을 저장한 뒤 바꿔 주세요');
                  return;
                }
                store.setTimerMode('stopwatch');
              }}
            >
              스톱워치
            </button>
            <button
              aria-pressed={mode === 'pomodoro'}
              onClick={() => {
                if (running || elapsed > 0) {
                  showToast('진행 중인 기록을 저장한 뒤 바꿔 주세요');
                  return;
                }
                store.setTimerMode('pomodoro');
              }}
            >
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

        <div className="timer-foot">
          <button
            className="focus-chip"
            aria-pressed={focusGrayOn}
            aria-label="타이머 실행 중 흑백 집중 모드"
            title={
              data.settings.focusGrayscale
                ? '누르면 흑백 집중 모드를 끕니다'
                : '누르면 타이머를 재는 동안 화면이 흑백이 됩니다'
            }
            onClick={() => store.updateSettings({ focusGrayscale: !data.settings.focusGrayscale })}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
              <path d="M12 3a9 9 0 0 1 0 18V3Z" fill="currentColor" />
            </svg>
            {data.settings.focusGrayscale ? (focusGrayOn ? '흑백 집중 중' : '흑백 집중 켜짐') : '흑백 집중 꺼짐'}
          </button>
          {timer && elapsed > 0 && (
            <button className="timer-reset" onClick={handleReset}>
              초기화
            </button>
          )}
        </div>
      </section>

      <div className="card-flat" style={{ overflow: 'hidden' }}>
        <div className="chip-row" style={{ padding: '12px 12px 10px' }}>
          {subjects.map((s) => (
            <button
              key={s.id}
              className="chip"
              aria-pressed={s.id === subjectId}
              style={{ ['--chip-color' as string]: s.color, opacity: elapsed > 0 && s.id !== subjectId ? 0.45 : 1 }}
              onClick={() => {
                if (elapsed > 0) {
                  showToast('진행 중인 기록을 저장한 뒤 바꿔 주세요');
                  return;
                }
                setSubjectId(s.id);
              }}
            >
              <span className="dot" style={{ background: s.color }} />
              {s.name}
            </button>
          ))}
          <AddSubjectChip
            onAdded={(id) => {
              if (elapsed > 0) {
                showToast('과목을 추가했어요. 진행 중인 기록을 저장한 뒤 선택돼요');
                return;
              }
              setSubjectId(id);
            }}
          />
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

      <SessionLogCard
        date={today}
        title="오늘 기록"
        emptyText="아직 기록이 없어요. 과목을 고르고 타이머를 시작해 보세요."
        notify={showToast}
      />
    </main>
  );
}
