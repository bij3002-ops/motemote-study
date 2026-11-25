import { useEffect, useMemo, useState } from 'react';
import { countKnown, speakEnglish, wordsOfDay, wordsOfPart, type VocaData } from '../../lib/voca';
import type { VocaProgressStore } from '../../hooks/useVocaProgress';
import { DayStrip, PartChips, VocaRow, pad2 } from './VocaBits';

type Props = {
  data: VocaData;
  part: number;
  day: number;
  onPart: (index: number) => void;
  onDay: (day: number) => void;
  voca: VocaProgressStore;
  showToast: (text: string) => void;
};

export default function VocaListView({ data, part, day, onPart, onDay, voca, showToast }: Props) {
  const [hideMeaning, setHideMeaning] = useState(false);
  const [hideWord, setHideWord] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const partWords = useMemo(() => wordsOfPart(data, part), [data, part]);
  const dayWords = useMemo(() => wordsOfDay(data, part, day), [data, part, day]);
  const partInfo = data.parts[part];

  const dayProgress = useMemo(() => {
    const map = new Map<number, { total: number; known: number }>();
    for (const w of partWords) {
      const row = map.get(w.day) ?? { total: 0, known: 0 };
      row.total += 1;
      if (voca.known.has(w.i)) row.known += 1;
      map.set(w.day, row);
    }
    return map;
  }, [partWords, voca.known]);

  const progressOf = (d: number) => dayProgress.get(d) ?? { total: 0, known: 0 };

  useEffect(() => {
    setRevealed(new Set());
  }, [part, day, hideMeaning, hideWord, onlyNew]);

  const knownInDay = countKnown(dayWords, voca.known);
  const list = onlyNew ? dayWords.filter((w) => !voca.known.has(w.i)) : dayWords;
  const pct = dayWords.length ? Math.round((knownInDay / dayWords.length) * 100) : 0;

  const speak = (text: string) => {
    if (!speakEnglish(text)) showToast('이 브라우저에서는 발음을 들려줄 수 없어요');
  };

  return (
    <>
      <PartChips parts={data.parts} part={part} onSelect={onPart} />
      <DayStrip days={partInfo.days} day={day} progressOf={progressOf} onSelect={onDay} />

      <div className="voca-summary card">
        <div className="voca-summary-top">
          <div>
            <p className="voca-summary-k">
              {partInfo.name} · DAY {pad2(day)}
            </p>
            <p className="voca-summary-v num">
              {knownInDay}
              <small> / {dayWords.length}개 외움</small>
            </p>
          </div>
          <span className={`voca-pct num${pct === 100 ? ' full' : ''}`}>{pct}%</span>
        </div>
        <div className="voca-bar" aria-hidden="true">
          <span style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="voca-controls">
        <button
          className="voca-toggle"
          aria-pressed={hideMeaning}
          onClick={() => {
            setHideMeaning((v) => !v);
            setHideWord(false);
          }}
        >
          뜻 가리기
        </button>
        <button
          className="voca-toggle"
          aria-pressed={hideWord}
          onClick={() => {
            setHideWord((v) => !v);
            setHideMeaning(false);
          }}
        >
          단어 가리기
        </button>
        <button className="voca-toggle" aria-pressed={onlyNew} onClick={() => setOnlyNew((v) => !v)}>
          안 외운 단어만
        </button>
      </div>

      {list.length === 0 ? (
        <div className="card empty">{onlyNew ? '이 DAY의 단어를 다 외웠어요 🎉' : '이 DAY에 단어가 없어요'}</div>
      ) : (
        <ul className="voca-list">
          {list.map((w) => (
            <VocaRow
              key={w.i}
              word={w}
              hideWord={hideWord}
              hideMeaning={hideMeaning}
              revealed={revealed.has(w.i)}
              onReveal={() =>
                setRevealed((prev) => {
                  const next = new Set(prev);
                  next.add(w.i);
                  return next;
                })
              }
              known={voca.known.has(w.i)}
              favorite={voca.favorites.has(w.i)}
              onToggleKnown={() => voca.toggleKnown(w.i)}
              onToggleFavorite={() => {
                const added = voca.toggleFavorite(w.i);
                showToast(added ? '즐겨찾기에 담았어요' : '즐겨찾기에서 뺐어요');
              }}
              onSpeak={() => speak(w.word)}
            />
          ))}
        </ul>
      )}
    </>
  );
}
