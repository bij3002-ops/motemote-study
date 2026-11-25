import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { beepAnswerStart, beepFinish, beepTick, unlockAudio } from '../../lib/beep';
import { formatClock, type ToeicPart, type ToeicQuestion } from '../../lib/speaking';

type Phase = 'ready' | 'read' | 'prep' | 'answer' | 'done';

const PHASE_META: Record<Phase, { label: string; sub: string }> = {
  ready: { label: '준비', sub: '시작을 누르면 실제 시험처럼 흘러갑니다' },
  read: { label: '지문 읽기', sub: '표의 시간·장소·요금을 훑어보세요' },
  prep: { label: '답변 준비', sub: '첫 문장만 정해 두세요' },
  answer: { label: '답변', sub: '지금부터 말하세요!' },
  done: { label: '끝', sub: '내 녹음을 들어 보며 다시 말해 보세요' },
};

/**
 * 토스 실전 타이머 — 준비 시간 → 비프음 → 답변 카운트다운.
 * 시간은 deadline 기준으로 계산해 화면이 잠깐 멈춰도 어긋나지 않는다.
 */
export default function TossTimer({
  part,
  question,
  onClose,
}: {
  part: ToeicPart;
  question: ToeicQuestion;
  onClose: () => void;
}) {
  const firstPhase: Phase = part.readSec > 0 ? 'read' : 'prep';
  const [phase, setPhase] = useState<Phase>('ready');
  const [remaining, setRemaining] = useState(part.readSec > 0 ? part.readSec : part.prepSec);
  const [running, setRunning] = useState(false);
  const [repeat, setRepeat] = useState(0);

  const deadlineRef = useRef(0);
  const lastTickRef = useRef(99);

  const phaseSeconds = (p: Phase): number => {
    if (p === 'read') return part.readSec;
    if (p === 'prep') return part.prepSec;
    if (p === 'answer') return question.answerSec;
    return 0;
  };

  const startPhase = (p: Phase) => {
    const sec = phaseSeconds(p);
    setPhase(p);
    setRemaining(sec);
    lastTickRef.current = 99;
    deadlineRef.current = Date.now() + sec * 1000;
    setRunning(true);
  };

  // 타이머 본체
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      const left = (deadlineRef.current - Date.now()) / 1000;
      setRemaining(Math.max(0, left));

      if (phase === 'answer' && left > 0 && left <= 3.05) {
        const whole = Math.ceil(left);
        if (whole < lastTickRef.current) {
          lastTickRef.current = whole;
          beepTick();
        }
      }
      if (left > 0) return;

      // 단계 종료
      setRunning(false);
      if (phase === 'read') {
        beepTick();
        startPhase('prep');
      } else if (phase === 'prep') {
        beepAnswerStart();
        startPhase('answer');
      } else if (phase === 'answer') {
        beepFinish();
        setPhase('done');
        setRemaining(0);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [running, phase, part, question.answerSec]);

  const skip = () => {
    setRunning(false);
    if (phase === 'ready') {
      startPhase(firstPhase);
      return;
    }
    if (phase === 'read') {
      startPhase('prep');
      return;
    }
    if (phase === 'prep') {
      beepAnswerStart();
      startPhase('answer');
      return;
    }
    if (phase === 'answer') {
      beepFinish();
      setPhase('done');
    }
  };

  const restart = () => {
    setRepeat((n) => n + 1);
    setPhase('ready');
    setRunning(false);
    setRemaining(firstPhase === 'read' ? part.readSec : part.prepSec);
  };

  const start = () => {
    unlockAudio();
    startPhase(firstPhase);
  };

  const total = phaseSeconds(phase === 'done' ? 'answer' : phase) || 1;
  const ratio = phase === 'ready' ? 1 : Math.max(0, Math.min(1, remaining / total));
  const circumference = 2 * Math.PI * 54;
  const clock = formatClock(remaining);
  const meta = PHASE_META[phase];

  return createPortal(
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet toss-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="토스 실전 타이머"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" />
        <div className="toss-head">
          <div>
            <p className="eyebrow">
              TOEIC SPEAKING · PART {part.part} · {part.range}
            </p>
            <h3 className="sheet-title">실전 타이머</h3>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="타이머 닫기">
            ✕
          </button>
        </div>

        <p className="toss-q" lang="en">
          {question.q}
        </p>

        <div className={`toss-clock${phase === 'answer' ? ' is-answer' : ''}${phase === 'done' ? ' is-done' : ''}`}>
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle className="toss-ring-bg" cx="60" cy="60" r="54" />
            <circle
              className="toss-ring"
              cx="60"
              cy="60"
              r="54"
              style={{ strokeDasharray: circumference, strokeDashoffset: circumference * (1 - ratio) }}
            />
          </svg>
          <div className="toss-clock-face">
            <strong className="num">{phase === 'ready' ? formatClock(phaseSeconds(firstPhase)) : clock}</strong>
            <span>{meta.label}</span>
          </div>
        </div>

        <p className="toss-sub">{meta.sub}</p>
        <p className="toss-spec">
          {part.timingNote} · 이 문항 답변 {question.answerSec}초
          {repeat > 0 ? ` · ${repeat}회 반복` : ''}
        </p>

        <div className="toss-actions">
          {phase === 'ready' && (
            <button type="button" className="btn btn-primary" onClick={start}>
              시작 ({phaseSeconds(firstPhase)}초)
            </button>
          )}
          {running && phase !== 'ready' && (
            <>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setRunning(false);
                  deadlineRef.current = Date.now() + remaining * 1000;
                }}
              >
                일시정지
              </button>
              <button type="button" className="btn btn-line" onClick={skip}>
                {phase === 'answer' ? '답변 끝내기' : '건너뛰기'}
              </button>
            </>
          )}
          {!running && phase !== 'ready' && phase !== 'done' && (
            <>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  unlockAudio();
                  setRunning(true);
                  deadlineRef.current = Date.now() + remaining * 1000;
                }}
              >
                이어서
              </button>
              <button type="button" className="btn btn-line" onClick={skip}>
                건너뛰기
              </button>
            </>
          )}
          {phase === 'done' && (
            <button type="button" className="btn btn-primary" onClick={restart}>
              다시 하기
            </button>
          )}
        </div>

        <p className="toss-note">
          {phase === 'answer'
            ? '지금 말하고 있다면 끝까지! 끊지 말고 3초 침묵해도 괜찮아요.'
            : '준비 시간에는 첫 문장과 마지막 문장만 정해 두면 됩니다.'}
        </p>
      </div>
    </div>,
    document.body,
  );
}
