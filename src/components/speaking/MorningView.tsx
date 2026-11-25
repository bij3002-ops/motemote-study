import { useMemo, useState } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import { kindLabel, splitSentences, type MorningCard, type SpeakingData } from '../../lib/speaking';
import { speakingPlayer } from '../../lib/tts';
import { SpeakButton } from './PlayButtons';
import RecorderBar from './RecorderBar';

function SpeechChip({ playKey, text }: { playKey: string; text: string }) {
  const { key } = usePlayer();
  const active = key === playKey;
  return (
    <button
      type="button"
      className={`sent-play${active ? ' on' : ''}`}
      aria-label={active ? '멈춤' : '이 문장 듣기'}
      onClick={() => speakingPlayer.play(playKey, [{ text }])}
    >
      {active ? '■' : '▶'}
    </button>
  );
}

function Card({ card }: { card: MorningCard }) {
  const [open, setOpen] = useState(false);
  const isSentence = card.kind === 'sentence';
  const exampleSentences = card.example ? splitSentences(card.example) : [];

  return (
    <article className={`card morning-card${isSentence ? ' is-sentence' : ''}`}>
      <div className="speak-card-head">
        <span className={`speak-badge kind-${card.kind}`}>{kindLabel(card.kind)}</span>
        <span className="morning-meta">
          {card.tag && <span className="morning-tag">{card.tag}</span>}
          <span>{card.day}</span>
        </span>
      </div>

      <p className={`morning-front${isSentence ? ' is-my-sentence' : ''}`} lang={isSentence ? 'en' : undefined}>
        {isSentence && <span className="morning-label">내가 말한 문장</span>}
        {card.front}
      </p>

      <div className="morning-back-row">
        <p className="morning-back" lang="en">
          {isSentence && <span className="morning-label">교정</span>}
          {card.back}
        </p>
        <SpeakButton
          playKey={`${card.id}:back`}
          segments={[
            {
              // 단어는 기기 음성으로 또박또박, 패턴·교정은 통화에서 쓴 예문 오디오로
              text: card.kind === 'word' ? card.back.split(' — ')[0] : card.back,
              audio: card.kind === 'word' ? null : card.audio,
            },
          ]}
          label={card.kind === 'word' ? '발음' : '듣기'}
          size="sm"
        />
      </div>

      {card.example && (
        <div className="morning-example">
          <SpeechChip playKey={`${card.id}:ex`} text={card.example} />
          <span lang="en">{card.example}</span>
        </div>
      )}

      <div className="speak-row speak-row-tight">
        <SpeakButton
          playKey={`${card.id}:ex2`}
          segments={[{ text: isSentence ? card.back : card.example || card.back, audio: card.audio }]}
          label="예문 듣고 따라 말하기"
          repeat={2}
          size="sm"
          tone="line"
        />
        <button type="button" className="speak-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? '녹음·설명 접기 ▲' : '녹음·설명 ▼'}
        </button>
      </div>

      {open && (
        <div className="speak-answer">
          {exampleSentences.length > 1 && (
            <div className="sent-list" lang="en">
              {exampleSentences.map((sentence, i) => (
                <div className="sent-row" key={`${card.id}-s${i}`}>
                  <SpeechChip playKey={`${card.id}:s${i}`} text={sentence} />
                  <span>{sentence}</span>
                </div>
              ))}
            </div>
          )}
          {card.note && (
            <div className="morning-note">
              <p className="speak-sub-title">통화에서 짚은 것</p>
              <p>{card.note}</p>
            </div>
          )}
          <RecorderBar />
        </div>
      )}
    </article>
  );
}

const KINDS: Array<{ key: 'all' | MorningCard['kind']; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'sentence', label: '교정' },
  { key: 'word', label: '단어' },
  { key: 'pattern', label: '패턴' },
];

export default function MorningView({ data }: { data: SpeakingData }) {
  const [kind, setKind] = useState<'all' | MorningCard['kind']>('all');
  const [day, setDay] = useState<string>('all');

  const counts = useMemo(() => {
    const c = { all: data.morning.cards.length, sentence: 0, word: 0, pattern: 0 };
    for (const card of data.morning.cards) c[card.kind] += 1;
    return c;
  }, [data.morning.cards]);

  const cards = useMemo(
    () =>
      data.morning.cards.filter(
        (card) => (kind === 'all' || card.kind === kind) && (day === 'all' || card.day === day),
      ),
    [data.morning.cards, kind, day],
  );

  return (
    <div className="speak-body">
      <div className="morning-summary card-flat">
        <div>
          <p className="morning-summary-big num">{data.morning.cards.length}</p>
          <p className="morning-summary-label">
            아침 통화 표현 · {data.morning.days.length}일치
          </p>
        </div>
        <p className="morning-summary-note">{data.morning.note}</p>
      </div>

      <div className="chip-row speak-topic-row" role="tablist" aria-label="복습 종류">
        {KINDS.map((k) => (
          <button
            key={k.key}
            role="tab"
            aria-selected={kind === k.key}
            aria-pressed={kind === k.key}
            className="chip"
            onClick={() => setKind(k.key)}
          >
            {k.label}
            <span className="speak-chip-count">{counts[k.key]}</span>
          </button>
        ))}
      </div>

      <div className="chip-row speak-day-row" role="group" aria-label="통화 날짜">
        <button type="button" className="chip" aria-pressed={day === 'all'} onClick={() => setDay('all')}>
          최신순 전체
        </button>
        {data.morning.days.map((d) => (
          <button key={d} type="button" className="chip num" aria-pressed={day === d} onClick={() => setDay(d)}>
            {d.slice(5).replace('-', '/')}
          </button>
        ))}
      </div>

      {cards.length === 0 && <div className="empty">이 조건의 복습 카드가 없어요</div>}
      {cards.map((card) => (
        <Card key={card.id} card={card} />
      ))}
    </div>
  );
}
