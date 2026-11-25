import { useState } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import { splitSentences, type OpicQuestion, type SpeakingData } from '../../lib/speaking';
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

function QuestionCard({ question, index }: { question: OpicQuestion; index: number }) {
  const [open, setOpen] = useState(false);
  const [showKo, setShowKo] = useState(false);
  const sentences = splitSentences(question.a);

  return (
    <article className="card speak-card">
      <div className="speak-card-head">
        <span className="speak-badge">Q{index + 1}</span>
        <span className="speak-level">AL 모범답안</span>
      </div>

      <p className="speak-q" lang="en">
        {question.q}
      </p>
      <p className="speak-q-ko">{question.qKo}</p>

      <div className="speak-row">
        <SpeakButton
          playKey={`${question.id}:q`}
          segments={[{ text: question.q, audio: question.audio.q }]}
          label="질문 듣기"
          size="sm"
          tone="line"
        />
        <SpeakButton
          playKey={`${question.id}:a`}
          segments={[{ text: question.a, audio: question.audio.a }]}
          label="답변 듣기"
          size="sm"
          tone="line"
        />
        <button type="button" className="speak-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? '모범답안 접기 ▲' : '모범답안 보기 ▼'}
        </button>
      </div>

      {open && (
        <div className="speak-answer">
          <div className="sent-list" lang="en">
            {sentences.map((sentence, i) => (
              <div className="sent-row" key={`${question.id}-s${i}`}>
                <SpeechChip playKey={`${question.id}:s${i}`} text={sentence} />
                <span>{sentence}</span>
              </div>
            ))}
          </div>

          <div className="speak-row speak-row-tight">
            <SpeakButton
              playKey={`${question.id}:a2`}
              segments={[{ text: question.a, audio: question.audio.a }]}
              label="전체 한 번 더"
              repeat={2}
              size="sm"
            />
            <button type="button" className="speak-toggle" aria-pressed={showKo} onClick={() => setShowKo((v) => !v)}>
              {showKo ? '한국어 해석 숨기기' : '한국어 해석 보기'}
            </button>
          </div>
          {showKo && <p className="speak-ko">{question.aKo}</p>}

          <div className="speak-block">
            <p className="speak-sub-title">핵심 표현</p>
            <div className="expr-list">
              {question.expr.map((expr) => (
                <div className="expr-row" key={expr.en}>
                  <SpeechChip playKey={`${question.id}:x:${expr.en}`} text={expr.en} />
                  <div className="expr-text">
                    <b lang="en">{expr.en}</b>
                    <span>{expr.ko}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="speak-block">
            <p className="speak-sub-title">꼬리질문</p>
            <div className="follow-list">
              {question.follow.map((f) => (
                <div className="follow-row" key={f.q}>
                  <SpeechChip playKey={`${question.id}:f:${f.q}`} text={f.q} />
                  <div className="follow-text">
                    <b lang="en">{f.q}</b>
                    {f.qKo && <span>{f.qKo}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <RecorderBar />
    </article>
  );
}

export default function OpicView({ data }: { data: SpeakingData }) {
  const topics = data.opic.topics;
  const [topicId, setTopicId] = useState(topics[0]?.id ?? '');
  const topic = topics.find((t) => t.id === topicId) ?? topics[0];

  return (
    <div className="speak-body">
      <div className="chip-row speak-topic-row" role="tablist" aria-label="오픽 주제">
        {topics.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={t.id === topic?.id}
            aria-pressed={t.id === topic?.id}
            className="chip"
            onClick={() => setTopicId(t.id)}
          >
            <span aria-hidden="true">{t.emoji}</span>
            {t.title}
            <span className="speak-chip-count">{t.questions.length}</span>
          </button>
        ))}
      </div>

      {topic && (
        <>
          <div className="speak-topic-head">
            <h2>
              <span aria-hidden="true">{topic.emoji}</span> {topic.title}
            </h2>
            <span className="hint">
              질문 {topic.questions.length}개 · {data.opic.note}
            </span>
          </div>
          {topic.questions.map((q, i) => (
            <QuestionCard key={q.id} question={q} index={i} />
          ))}
        </>
      )}
    </div>
  );
}
