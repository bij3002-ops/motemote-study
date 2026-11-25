import type { CbtQuestion } from '../../lib/cbt';
import { assetUrl, CHOICE_LABEL } from '../../lib/cbt';

type Props = {
  q: CbtQuestion;
  subjectName: string;
  selected?: number | null;
  /** 정답 공개(채점 후 · 연습 모드) */
  revealed?: boolean;
  onSelect?: (n: number) => void;
  starred?: boolean;
  onStar?: () => void;
  compact?: boolean;
};

export default function QuestionView({
  q,
  subjectName,
  selected,
  revealed = false,
  onSelect,
  starred = false,
  onStar,
  compact = false,
}: Props) {
  const hasTextChoices = q.choices.some((c) => c.trim().length > 0);
  return (
    <article className={`card cbt-q${compact ? ' compact' : ''}`}>
      <div className="cbt-q-head">
        <span className="cbt-q-no num">{q.n}</span>
        <span className="cbt-q-subject">{subjectName}</span>
        {onStar && (
          <button
            type="button"
            className={`cbt-star${starred ? ' on' : ''}`}
            onClick={onStar}
            aria-pressed={starred}
            aria-label={starred ? '별표 해제' : '별표 표시'}
          >
            <svg viewBox="0 0 24 24" fill={starred ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
              <path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z" />
            </svg>
          </button>
        )}
      </div>

      {q.body && !q.image && <p className="cbt-q-body">{q.body}</p>}

      {q.image && (
        <img
          className="cbt-figure"
          src={assetUrl(q.image)}
          alt={`${q.n}번 문제 그림`}
          width={q.imageW ?? undefined}
          height={q.imageH ?? undefined}
          loading="lazy"
          decoding="async"
        />
      )}

      <div className={`cbt-choices${hasTextChoices ? '' : ' bare'}`} role={onSelect ? 'radiogroup' : 'presentation'}>
        {q.choices.map((text, i) => {
          const value = i + 1;
          const isSelected = selected === value;
          const isAnswer = revealed && q.answer === value;
          const isWrongPick = revealed && isSelected && q.answer !== value;
          const cls = [
            'cbt-choice',
            isSelected ? 'is-selected' : '',
            isAnswer ? 'is-correct' : '',
            isWrongPick ? 'is-wrong' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={value}
              type="button"
              className={cls}
              aria-pressed={isSelected}
              role={onSelect ? 'radio' : undefined}
              disabled={!onSelect}
              onClick={() => onSelect?.(value)}
            >
              <span className="cbt-choice-no">{CHOICE_LABEL[i]}</span>
              {hasTextChoices && <span className="cbt-choice-text">{text}</span>}
            </button>
          );
        })}
      </div>
    </article>
  );
}

export function AnswerPanel({ q }: { q: CbtQuestion }) {
  return (
    <div className="card cbt-explain">
      <div className="cbt-explain-head">
        <span className="cbt-answer-badge">정답 {CHOICE_LABEL[q.answer - 1]}</span>
        {q.choices[q.answer - 1] && <span className="cbt-answer-text">{q.choices[q.answer - 1]}</span>}
      </div>
      {q.explain ? (
        <p className="cbt-explain-body">{q.explain}</p>
      ) : (
        <p className="cbt-explain-empty">
          이 회차는 해설집이 공개되지 않아 해설이 없어요. 정답만 확인할 수 있어요.
        </p>
      )}
    </div>
  );
}
