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
import { SpeakerIcon, pad2 } from './VocaBits';

type Range = 'day' | 'part' | 'fav' | 'wrong';

const RANGES: Array<{ key: Range; label: string }> = [
  { key: 'day', label: '이 DAY' },
  { key: 'part', label: '파트 전체' },
  { key: 'fav', label: '즐겨찾기' },
  { key: 'wrong', label: '오답' },
];

const COUNTS = [10, 20, 30];

type Question = { word: VocaWord; choices: string[]; answer: number };

type QuizState = {
  questions: Question[];
  index: number;
  picked: number | null;
  wrongIds: number[];
  done: boolean;
};

type Props = {
  data: VocaData;
  part: number;
  day: number;
  voca: VocaProgressStore;
  showToast: (text: string) => void;
};

function buildQuestions(pool: VocaWord[], distractors: VocaWord[], count: number): Question[] {
  const picked = shuffle(pool).slice(0, count);
  return picked.map((word) => {
    const choices = [word.meaning];
    const candidates = shuffle(distractors);
    for (const c of candidates) {
      if (choices.length >= 4) break;
      if (c.i === word.i) continue;
      if (c.meaning === word.meaning) continue;
      if (choices.includes(c.meaning)) continue;
      choices.push(c.meaning);
    }
    const mixed = shuffle(choices);
    return { word, choices: mixed, answer: mixed.indexOf(word.meaning) };
  });
}

export default function VocaQuizView({ data, part, day, voca, showToast }: Props) {
  const [range, setRange] = useState<Range>('day');
  const [count, setCount] = useState(10);
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const timer = useRef<number | null>(null);

  const vocaRef = useRef(voca);
  vocaRef.current = voca;

  const pool = useMemo(() => {
    if (range === 'day') return wordsOfDay(data, part, day);
    if (range === 'part') return wordsOfPart(data, part);
    if (range === 'fav') return data.words.filter((w) => voca.favorites.has(w.i));
    return data.words.filter((w) => voca.wrong.has(w.i));
  }, [data, part, day, range, voca.favorites, voca.wrong]);

  const distractorPool = useMemo(() => {
    if (range === 'day' || range === 'part') {
      const partWords = wordsOfPart(data, part);
      return partWords.length >= 4 ? partWords : data.words;
    }
    return data.words;
  }, [data, part, range]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const start = useCallback(
    (words?: VocaWord[]) => {
      const source = words ?? pool;
      if (source.length < 4) {
        showToast('4개 이상 단어가 있어야 퀴즈를 낼 수 있어요');
        return;
      }
      const questions = buildQuestions(source, distractorPool, Math.min(count, source.length));
      setQuiz({ questions, index: 0, picked: null, wrongIds: [], done: false });
    },
    [count, distractorPool, pool, showToast],
  );

  const pick = (choice: number) => {
    if (!quiz || quiz.picked !== null || quiz.done) return;
    const question = quiz.questions[quiz.index];
    const correct = choice === question.answer;
    if (!correct) voca.markWrong(question.word.i);
    setQuiz({
      ...quiz,
      picked: choice,
      wrongIds: correct ? quiz.wrongIds : [...quiz.wrongIds, question.word.i],
    });
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setQuiz((prev) => {
        if (!prev) return prev;
        const nextIndex = prev.index + 1;
        if (nextIndex >= prev.questions.length) return { ...prev, done: true, picked: null };
        return { ...prev, index: nextIndex, picked: null };
      });
    }, 1100);
  };

  const speak = (text: string) => {
    if (!speakEnglish(text)) showToast('이 브라우저에서는 발음을 들려줄 수 없어요');
  };

  if (!quiz) {
    const canStart = pool.length >= 4;
    return (
      <>
        <div className="card voca-quiz-setup">
          <p className="voca-setup-title">무엇으로 낼까요?</p>
          <div className="chip-row" role="group" aria-label="퀴즈 범위">
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
          <p className="voca-setup-sub">
            {range === 'day'
              ? `${data.parts[part].label} DAY ${pad2(day)}`
              : range === 'part'
                ? data.parts[part].name
                : range === 'fav'
                  ? '즐겨찾기한 단어'
                  : '오답노트'}{' '}
            · <b className="num">{pool.length.toLocaleString('ko-KR')}</b>개
          </p>
          <div className="seg" role="group" aria-label="문항 수">
            {COUNTS.map((n) => (
              <button key={n} aria-pressed={count === n} onClick={() => setCount(n)}>
                <span className="num">{n}</span>문항
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => start()} disabled={!canStart}>
            {Math.min(count, pool.length)}문항 퀴즈 시작
          </button>
          {!canStart && (
            <p className="hint">
              {range === 'fav'
                ? '즐겨찾기한 단어가 4개 이상이어야 시작할 수 있어요'
                : range === 'wrong'
                  ? '오답노트에 단어가 4개 이상 쌓이면 시작할 수 있어요'
                  : '이 범위에 단어가 부족해요'}
            </p>
          )}
        </div>
        <p className="hint center">영단어를 보고 알맞은 뜻을 고르세요 · 틀린 단어는 오답노트에 저장돼요</p>
      </>
    );
  }

  if (quiz.done) {
    const total = quiz.questions.length;
    const wrongCount = quiz.wrongIds.length;
    const correct = total - wrongCount;
    const score = Math.round((correct / total) * 100);
    const wrongWords = quiz.wrongIds.map((i) => data.words[i]).filter(Boolean);
    return (
      <>
        <div className="card voca-result">
          <p className="voca-result-k">퀴즈 결과</p>
          <p className="voca-result-score num">
            {correct}
            <small> / {total}</small>
          </p>
          <div className="voca-bar big" aria-hidden="true">
            <span style={{ width: `${score}%` }} />
          </div>
          <p className="voca-result-sub">
            {score === 100 ? '완벽해요! 이 범위는 끝났어요 🎉' : score >= 80 ? '좋아요, 거의 다 왔어요' : '틀린 단어를 카드로 한 번 더 돌려 보세요'}
          </p>
        </div>

        {wrongWords.length > 0 && (
          <>
            <div className="section-title">
              <h2>틀린 단어 {wrongWords.length}개</h2>
              <span className="hint">오답노트에 저장됨</span>
            </div>
            <ul className="voca-list compact">
              {wrongWords.map((w) => (
                <li className="voca-row" key={w.i}>
                  <div className="voca-row-main">
                    <div className="voca-word-line">
                      <span className="voca-word">{w.word}</span>
                      <button className="voca-speak" onClick={() => speak(w.word)} aria-label={`${w.word} 발음 듣기`}>
                        <SpeakerIcon size={17} />
                      </button>
                    </div>
                    <p className="voca-mean">{w.meaning}</p>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="voca-result-actions">
          {wrongWords.length >= 4 && (
            <button className="btn btn-primary" onClick={() => start(wrongWords)}>
              틀린 단어 다시 풀기
            </button>
          )}
          <button className="btn btn-ghost" onClick={() => start()}>
            같은 범위로 한 번 더
          </button>
          <button className="btn btn-line" onClick={() => setQuiz(null)}>
            범위 바꾸기
          </button>
        </div>
      </>
    );
  }

  const question = quiz.questions[quiz.index];
  const picked = quiz.picked;
  return (
    <>
      <div className="voca-card-head">
        <span className="voca-card-count num">
          {quiz.index + 1} / {quiz.questions.length}
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
      <div className="voca-bar" aria-hidden="true">
        <span style={{ width: `${(quiz.index / quiz.questions.length) * 100}%` }} />
      </div>

      <div className="voca-question">
        <span className="voca-question-word">{question.word.word}</span>
        <button className="voca-mini" onClick={() => speak(question.word.word)}>
          <SpeakerIcon size={16} /> 발음 듣기
        </button>
      </div>

      <div className="voca-choices">
        {question.choices.map((choice, idx) => {
          const isAnswer = idx === question.answer;
          const isPicked = idx === picked;
          const state = picked === null ? '' : isAnswer ? ' right' : isPicked ? ' wrong' : ' dim';
          return (
            <button
              key={`${question.word.i}-${idx}`}
              className={`voca-choice${state}`}
              onClick={() => pick(idx)}
              disabled={picked !== null}
            >
              <span className="voca-choice-no num">{idx + 1}</span>
              <span className="voca-choice-text">{choice}</span>
            </button>
          );
        })}
      </div>

      <button
        className="btn btn-ghost btn-sm"
        onClick={() => {
          if (timer.current) window.clearTimeout(timer.current);
          setQuiz({ ...quiz, done: true, picked: null });
        }}
      >
        그만 풀기
      </button>
    </>
  );
}
