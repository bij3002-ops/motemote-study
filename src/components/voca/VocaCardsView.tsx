import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  shuffle,
  speakEnglish,
  wordsOfDay,
  wordsOfPart,
  type VocaData,
  type VocaWord,
} from '../../lib/voca';
import type { VocaProgressStore } from '../../hooks/useVocaProgress';
import { SpeakerIcon, StarIcon, pad2 } from './VocaBits';

type Range = 'day' | 'part' | 'fav' | 'wrong';

const RANGES: Array<{ key: Range; label: string }> = [
  { key: 'day', label: '이 DAY' },
  { key: 'part', label: '파트 전체' },
  { key: 'fav', label: '즐겨찾기' },
  { key: 'wrong', label: '오답' },
];

type Props = {
  data: VocaData;
  part: number;
  day: number;
  voca: VocaProgressStore;
  showToast: (text: string) => void;
};

export default function VocaCardsView({ data, part, day, voca, showToast }: Props) {
  const [range, setRange] = useState<Range>('day');
  const [order, setOrder] = useState<number[]>([]);
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [stats, setStats] = useState({ knew: 0, again: 0 });
  const [done, setDone] = useState(false);

  const vocaRef = useRef(voca);
  vocaRef.current = voca;

  const poolFor = useCallback(
    (r: Range): VocaWord[] => {
      const store = vocaRef.current;
      if (r === 'day') return wordsOfDay(data, part, day);
      if (r === 'part') return wordsOfPart(data, part);
      if (r === 'fav') return data.words.filter((w) => store.favorites.has(w.i));
      return data.words.filter((w) => store.wrong.has(w.i));
    },
    [data, part, day],
  );

  const start = useCallback(
    (r: Range) => {
      const pool = shuffle(poolFor(r));
      setOrder(pool.map((w) => w.i));
      setPos(0);
      setFlipped(false);
      setStats({ knew: 0, again: 0 });
      setDone(false);
    },
    [poolFor],
  );

  useEffect(() => {
    start(range);
  }, [start, range]);

  const total = order.length;
  const current = total > 0 && pos < total ? data.words[order[pos]] : null;
  const poolSize = useMemo(() => poolFor(range).length, [poolFor, range]);

  const speak = (text: string) => {
    if (!speakEnglish(text)) showToast('이 브라우저에서는 발음을 들려줄 수 없어요');
  };

  const advance = (knew: boolean) => {
    if (!current) return;
    if (knew) voca.markKnown(current.i);
    else voca.markWrong(current.i);
    setStats((s) => ({ knew: s.knew + (knew ? 1 : 0), again: s.again + (knew ? 0 : 1) }));

    let nextOrder = order;
    if (!knew) {
      nextOrder = [...order, current.i];
      setOrder(nextOrder);
    }
    const nextPos = pos + 1;
    if (nextPos >= nextOrder.length) {
      setDone(true);
      return;
    }
    setPos(nextPos);
    setFlipped(false);
    if (autoSpeak) speakEnglish(data.words[nextOrder[nextPos]].word);
  };

  const flip = () => {
    if (!current || flipped) return;
    setFlipped(true);
    if (autoSpeak) speak(current.word);
  };

  return (
    <>
      <div className="chip-row" role="group" aria-label="카드 범위">
        {RANGES.map((r) => (
          <button
            key={r.key}
            className="chip"
            aria-pressed={range === r.key}
            onClick={() => setRange(r.key)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {total === 0 ? (
        <div className="card empty">
          {range === 'fav'
            ? '즐겨찾기한 단어가 없어요. 단어장에서 ★를 눌러 담아 보세요.'
            : range === 'wrong'
              ? '오답노트가 비어 있어요. 퀴즈에서 틀린 단어가 여기에 쌓여요.'
              : '이 범위에 단어가 없어요'}
        </div>
      ) : done ? (
        <div className="card voca-done">
          <p className="voca-done-title">카드 한 바퀴 끝! 🎉</p>
          <p className="voca-done-sub num">
            외웠음 {stats.knew}번 · 다시 {stats.again}번
          </p>
          <div className="voca-done-actions">
            <button className="btn btn-primary" onClick={() => start(range)}>
              한 번 더
            </button>
            <button className="btn btn-ghost" onClick={() => setRange(range === 'fav' ? 'day' : 'fav')}>
              즐겨찾기 카드
            </button>
          </div>
        </div>
      ) : (
        current && (
          <>
            <div className="voca-card-head">
              <span className="voca-card-count num">
                {Math.min(pos + 1, total)} / {total}
              </span>
              <span className="voca-card-scope">
                {range === 'day'
                  ? `${data.parts[part].label} · DAY ${pad2(day)}`
                  : range === 'part'
                    ? data.parts[part].name
                    : range === 'fav'
                      ? '즐겨찾기'
                      : '오답노트'}
              </span>
            </div>

            <button className="voca-card" onClick={flip} aria-label="카드를 눌러 뜻 보기">
              <span className="voca-card-word">{current.word}</span>
              {flipped ? (
                <span className="voca-card-mean">{current.meaning}</span>
              ) : (
                <span className="voca-card-hint">탭해서 뜻 보기</span>
              )}
              <span className="voca-card-badge">
                {voca.favorites.has(current.i) ? '★ 즐겨찾기' : voca.wrong.has(current.i) ? '오답' : ''}
              </span>
            </button>

            <div className="voca-card-tools">
              <button className="voca-mini" onClick={() => speak(current.word)}>
                <SpeakerIcon size={16} /> 발음
              </button>
              <button
                className={`voca-mini${voca.favorites.has(current.i) ? ' on' : ''}`}
                onClick={() => voca.toggleFavorite(current.i)}
                aria-pressed={voca.favorites.has(current.i)}
              >
                <StarIcon filled={voca.favorites.has(current.i)} /> 즐겨찾기
              </button>
              <button
                className={`voca-mini${autoSpeak ? ' on' : ''}`}
                onClick={() => setAutoSpeak((v) => !v)}
                aria-pressed={autoSpeak}
              >
                자동 발음
              </button>
            </div>

            <div className="voca-card-actions">
              <button className="btn btn-line" onClick={() => advance(false)}>
                모르겠음
              </button>
              <button className="btn btn-primary" onClick={() => advance(true)}>
                외웠음
              </button>
            </div>
            <p className="hint center">
              {poolSize.toLocaleString('ko-KR')}개 중 섞어서 · 모르겠음은 뒤에 다시 나와요
            </p>
          </>
        )
      )}
    </>
  );
}
