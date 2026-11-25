import { useState } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import { splitSentences, type SpeakingData, type ToeicQuestion, type ToeicTable } from '../../lib/speaking';
import { speakingPlayer } from '../../lib/tts';
import { SpeakButton } from './PlayButtons';
import RecorderBar from './RecorderBar';
import TossTimer from './TossTimer';

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

function InfoTable({ table }: { table: ToeicTable }) {
  return (
    <div className="speak-table-wrap card-flat">
      <p className="speak-table-title">{table.title}</p>
      <table className="speak-table">
        <thead>
          <tr>
            {table.columns.map((c) => (
              <th key={c} scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join('|')}>
              {row.map((cell, i) => (
                <td key={`${cell}-${i}`} className={i === 0 ? 'num' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.note && <p className="speak-table-note">{table.note}</p>}
    </div>
  );
}

function QuestionCard({
  part,
  question,
  index,
  onTimer,
}: {
  part: SpeakingData['toeic']['parts'][number];
  question: ToeicQuestion;
  index: number;
  onTimer: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [showKo, setShowKo] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const sentences = question.a ? splitSentences(question.a) : [];

  return (
    <article className="card speak-card">
      <div className="speak-card-head">
        <span className="speak-badge">Q{index + 1}</span>
        <span className="speak-level">
          준비 {part.prepSec}초 · 답변 {question.answerSec}초
        </span>
      </div>

      {question.passage && (
        <div className="speak-passage">
          <p lang="en">{question.passage}</p>
          {question.guide && (
            <>
              <button type="button" className="speak-toggle" aria-expanded={showGuide} onClick={() => setShowGuide((v) => !v)}>
                {showGuide ? '끊어 읽기 숨기기' : '끊어 읽기 표시 보기'}
              </button>
              {showGuide && (
                <p className="speak-guide" lang="en">
                  {question.guide}
                </p>
              )}
            </>
          )}
        </div>
      )}

      <p className="speak-q" lang="en">
        {question.q}
      </p>
      {question.qKo && <p className="speak-q-ko">{question.qKo}</p>}
      {question.sceneKo && <p className="speak-scene">사진 설명 · {question.sceneKo}</p>}

      <div className="speak-row">
        {question.audio.p && (
          <SpeakButton
            playKey={`${question.id}:p`}
            segments={[{ text: question.passage ?? '', audio: question.audio.p }]}
            label="지문 듣기"
            size="sm"
            tone="line"
          />
        )}
        {question.audio.q && (
          <SpeakButton
            playKey={`${question.id}:q`}
            segments={[{ text: question.q, audio: question.audio.q }]}
            label="질문 듣기"
            size="sm"
            tone="line"
          />
        )}
        <button type="button" className="spk-btn spk-solid spk-sm" onClick={onTimer}>
          <span className="spk-icon" aria-hidden="true">
            ⏱
          </span>
          실전 타이머
        </button>
      </div>

      {question.a && (
        <div className="speak-row speak-row-tight">
          <SpeakButton
            playKey={`${question.id}:a`}
            segments={[{ text: question.a, audio: question.audio.a }]}
            label="모범답안 듣기"
            size="sm"
            tone="line"
          />
          <button type="button" className="speak-toggle" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? '답안 접기 ▲' : '답안 보기 ▼'}
          </button>
        </div>
      )}

      {open && question.a && (
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
            {question.aKo && (
              <button type="button" className="speak-toggle" aria-pressed={showKo} onClick={() => setShowKo((v) => !v)}>
                {showKo ? '한국어 해석 숨기기' : '한국어 해석 보기'}
              </button>
            )}
          </div>
          {showKo && question.aKo && <p className="speak-ko">{question.aKo}</p>}

          {question.expr && question.expr.length > 0 && (
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
          )}

          {question.follow && question.follow.length > 0 && (
            <div className="speak-block">
              <p className="speak-sub-title">이어지는 질문</p>
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
          )}
        </div>
      )}

      <RecorderBar />
    </article>
  );
}

export default function ToeicView({ data }: { data: SpeakingData }) {
  const parts = data.toeic.parts;
  const [partId, setPartId] = useState(parts[0]?.id ?? '');
  const part = parts.find((p) => p.id === partId) ?? parts[0];
  const [timerFor, setTimerFor] = useState<ToeicQuestion | null>(null);
  const [showTips, setShowTips] = useState(false);

  return (
    <div className="speak-body">
      <div className="chip-row speak-topic-row" role="tablist" aria-label="토스 파트">
        {parts.map((p) => (
          <button
            key={p.id}
            role="tab"
            aria-selected={p.id === part?.id}
            aria-pressed={p.id === part?.id}
            className="chip"
            onClick={() => setPartId(p.id)}
          >
            Part {p.part} · {p.title}
          </button>
        ))}
      </div>

      {part && (
        <>
          <div className="speak-topic-head">
            <h2>
              Part {part.part} · {part.title}
            </h2>
            <span className="hint">
              {part.subtitle} · {part.range} · {part.timingNote}
            </span>
          </div>

          <div className="card-flat speak-tip-card">
            <button type="button" className="speak-tips-toggle" aria-expanded={showTips} onClick={() => setShowTips((v) => !v)}>
              <span>💡 {part.title} 공략 포인트</span>
              <span aria-hidden="true">{showTips ? '접기 ▲' : '보기 ▼'}</span>
            </button>
            {showTips && (
              <ul className="speak-tips">
                {part.tips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            )}
          </div>

          {part.sceneNote && <p className="speak-scene card-flat">{part.sceneNote}</p>}
          {part.table && <InfoTable table={part.table} />}

          {part.questions.map((q, i) => (
            <QuestionCard key={q.id} part={part} question={q} index={i} onTimer={() => setTimerFor(q)} />
          ))}

          {timerFor && <TossTimer part={part} question={timerFor} onClose={() => setTimerFor(null)} />}
        </>
      )}
    </div>
  );
}
