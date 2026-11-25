import { useState } from 'react';
import type { CbtQuestion, RoundData } from '../../lib/cbt';
import QuestionView, { AnswerPanel } from './QuestionView';

type Props = {
  data: RoundData;
  items: CbtQuestion[];
  title: string;
  subtitle?: string;
  onExit: () => void;
  isStarred: (n: number) => boolean;
  onStar: (n: number) => void;
  /** 채점 결과를 오답노트에 반영한다 */
  onGraded?: (q: CbtQuestion, correct: boolean) => void;
};

export default function PracticeView({ data, items, title, subtitle, onExit, isStarred, onStar, onGraded }: Props) {
  const [pos, setPos] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);

  const q = items[pos];
  if (!q) {
    return (
      <main className="screen cbt-screen">
        <header className="cbt-run-head">
          <button type="button" className="icon-btn" onClick={onExit} aria-label="나가기">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          <div className="cbt-run-title">
            <span className="cbt-run-round">{title}</span>
          </div>
        </header>
        <div className="card info-text">풀 문제가 없어요.</div>
      </main>
    );
  }

  const revealed = picked != null;
  const correct = revealed && picked === q.answer;

  const select = (value: number) => {
    if (revealed) return;
    setPicked(value);
    onGraded?.(q, value === q.answer);
  };

  const next = () => {
    setPicked(null);
    setPos((p) => Math.min(items.length - 1, p + 1));
  };
  const prev = () => {
    setPicked(null);
    setPos((p) => Math.max(0, p - 1));
  };

  return (
    <main className="screen cbt-screen cbt-runner">
      <header className="cbt-run-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="나가기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="cbt-run-title">
          <span className="cbt-run-round">{title}</span>
          <span className="cbt-run-scope">
            {subtitle ? `${subtitle} · ` : ''}
            <span className="num">{pos + 1}</span> / {items.length}
          </span>
        </div>
        {revealed && (
          <span className={`cbt-verdict${correct ? ' ok' : ' no'}`}>{correct ? '정답' : '오답'}</span>
        )}
      </header>

      <QuestionView
        q={q}
        subjectName={data.subjects[q.subject - 1] ?? ''}
        selected={picked}
        revealed={revealed}
        onSelect={select}
        starred={isStarred(q.n)}
        onStar={() => onStar(q.n)}
      />

      {revealed && <AnswerPanel q={q} />}

      <div className="cbt-run-foot">
        <button type="button" className="btn btn-ghost btn-sm" disabled={pos === 0} onClick={prev}>
          이전
        </button>
        {pos === items.length - 1 ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={onExit}>
            끝내기
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={next}>
            다음 문제
          </button>
        )}
      </div>
    </main>
  );
}
