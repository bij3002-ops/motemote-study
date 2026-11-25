import type { VocaPart, VocaWord } from '../../lib/voca';

export function SpeakerIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9.5h3.2L12 5.4v13.2L7.2 14.5H4z" />
      <path d="M15.5 8.7a4.4 4.4 0 0 1 0 6.6" />
      <path d="M18.3 6.2a8 8 0 0 1 0 11.6" />
    </svg>
  );
}

export function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m12 3.6 2.6 5.3 5.9.8-4.3 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.5 9.7l5.9-.8z" />
    </svg>
  );
}

export function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.7 4.6L19 6.7" />
    </svg>
  );
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export function PartChips({
  parts,
  part,
  onSelect,
}: {
  parts: VocaPart[];
  part: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="chip-row" role="group" aria-label="파트 선택">
      {parts.map((p) => (
        <button
          key={p.id}
          className="chip voca-part-chip"
          aria-pressed={part === p.index}
          onClick={() => onSelect(p.index)}
        >
          {p.label}
          <span className="voca-chip-count num">{p.count.toLocaleString('ko-KR')}</span>
        </button>
      ))}
    </div>
  );
}

export function DayStrip({
  days,
  day,
  progressOf,
  onSelect,
}: {
  days: number;
  day: number;
  progressOf: (day: number) => { total: number; known: number };
  onSelect: (day: number) => void;
}) {
  return (
    <div className="voca-days" role="group" aria-label="DAY 선택">
      {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
        const { total, known } = progressOf(d);
        const pct = total ? Math.round((known / total) * 100) : 0;
        return (
          <button
            key={d}
            className={`voca-day${d === day ? ' active' : ''}${pct === 100 ? ' done' : ''}`}
            aria-pressed={d === day}
            aria-label={`DAY ${pad2(d)} · ${known}/${total}개 외움`}
            onClick={() => onSelect(d)}
          >
            <span className="voca-day-label num">DAY {pad2(d)}</span>
            <i className="voca-day-bar" aria-hidden="true">
              <em style={{ width: `${pct}%` }} />
            </i>
          </button>
        );
      })}
    </div>
  );
}

export type VocaRowProps = {
  word: VocaWord;
  partLabel?: string;
  hideWord?: boolean;
  hideMeaning?: boolean;
  revealed: boolean;
  onReveal: () => void;
  known: boolean;
  favorite: boolean;
  onToggleKnown: () => void;
  onToggleFavorite: () => void;
  onSpeak: () => void;
};

export function VocaRow({
  word,
  partLabel,
  hideWord = false,
  hideMeaning = false,
  revealed,
  onReveal,
  known,
  favorite,
  onToggleKnown,
  onToggleFavorite,
  onSpeak,
}: VocaRowProps) {
  const wordHidden = hideWord && !revealed;
  const meaningHidden = hideMeaning && !revealed;
  return (
    <li className={`voca-row${known ? ' known' : ''}`}>
      <div className="voca-row-main">
        <div className="voca-word-line">
          {wordHidden ? (
            <button className="voca-veil" onClick={onReveal} aria-label="단어 보기">
              단어 보기
            </button>
          ) : (
            <span className="voca-word">{word.word}</span>
          )}
          <button className="voca-speak" onClick={onSpeak} aria-label={`${word.word} 발음 듣기`}>
            <SpeakerIcon size={17} />
          </button>
          {partLabel && <span className="voca-tag">{partLabel}</span>}
        </div>
        {meaningHidden ? (
          <button className="voca-veil sm" onClick={onReveal} aria-label="뜻 보기">
            뜻 보기
          </button>
        ) : (
          <p className="voca-mean">{word.meaning}</p>
        )}
      </div>
      <div className="voca-row-tools">
        <button
          className={`voca-tool star${favorite ? ' on' : ''}`}
          onClick={onToggleFavorite}
          aria-pressed={favorite}
          aria-label={favorite ? '즐겨찾기 해제' : '즐겨찾기'}
        >
          <StarIcon filled={favorite} />
        </button>
        <button
          className={`voca-tool check${known ? ' on' : ''}`}
          onClick={onToggleKnown}
          aria-pressed={known}
          aria-label={known ? '외움 해제' : '외움 표시'}
        >
          <CheckIcon />
        </button>
      </div>
    </li>
  );
}
