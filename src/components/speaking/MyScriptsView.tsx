import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePlayer } from '../../hooks/usePlayer';
import {
  broadcastSpeakingChange,
  loadSpeakingStore,
  newScriptId,
  saveSpeakingStore,
  SPEAKING_UPDATED_EVENT,
  splitSentences,
  type MyScript,
  type SpeakingStore,
} from '../../lib/speaking';
import { speakingPlayer } from '../../lib/tts';
import { SpeakButton } from './PlayButtons';
import RecorderBar from './RecorderBar';

type Draft = { id: string | null; title: string; question: string; answer: string; note: string };

const EMPTY_DRAFT: Draft = { id: null, title: '', question: '', answer: '', note: '' };

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

function formatDay(ts: number): string {
  const d = new Date(ts);
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

export default function MyScriptsView() {
  const [store, setStore] = useState<SpeakingStore>(() => loadSpeakingStore());
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  // 설정 탭에서 백업을 불러오면 다시 읽는다.
  useEffect(() => {
    const reload = () => setStore(loadSpeakingStore());
    window.addEventListener(SPEAKING_UPDATED_EVENT, reload);
    return () => window.removeEventListener(SPEAKING_UPDATED_EVENT, reload);
  }, []);

  const persist = (next: SpeakingStore) => {
    setStore(next);
    saveSpeakingStore(next);
    broadcastSpeakingChange();
  };

  const saveDraft = () => {
    if (!draft) return;
    const title = draft.title.trim();
    const answer = draft.answer.trim();
    if (!title || (!answer && !draft.question.trim())) return;
    const now = Date.now();
    let scripts: MyScript[];
    if (draft.id) {
      scripts = store.scripts.map((s) =>
        s.id === draft.id
          ? { ...s, title, question: draft.question.trim(), answer, note: draft.note.trim(), updatedAt: now }
          : s,
      );
    } else {
      scripts = [
        { id: newScriptId(), title, question: draft.question.trim(), answer, note: draft.note.trim(), createdAt: now, updatedAt: now },
        ...store.scripts,
      ];
    }
    persist({ ...store, scripts });
    setDraft(null);
    setOpenId(draft.id ?? scripts[0]?.id ?? null);
  };

  const remove = (script: MyScript) => {
    if (!window.confirm(`'${script.title}' 스크립트를 지울까요?`)) return;
    persist({ ...store, scripts: store.scripts.filter((s) => s.id !== script.id) });
  };

  const scripts = [...store.scripts].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="speak-body">
      <div className="myscript-head card-flat">
        <div>
          <p className="speak-sub-title">내 스크립트</p>
          <p className="hint">
            영어 질문·답변·메모를 직접 넣고 듣고 녹음하세요 · {scripts.length}개 · 이 기기에만 저장돼요
          </p>
        </div>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => setDraft({ ...EMPTY_DRAFT })}>
          + 추가
        </button>
      </div>

      {scripts.length === 0 && (
        <div className="card empty-card">
          <p>아직 내 스크립트가 없어요.</p>
          <p className="hint">
            오픽 돌발 질문처럼 시험장에서 자주 떠올릴 답을 미리 적어 두면, 아침 통화 전에 30초만 듣고 따라 말할 수 있어요.
          </p>
          <button type="button" className="btn btn-line btn-sm" onClick={() => setDraft({ ...EMPTY_DRAFT })}>
            첫 스크립트 만들기
          </button>
        </div>
      )}

      {scripts.map((script) => {
        const open = openId === script.id;
        const sentences = splitSentences(script.answer);
        return (
          <article className="card speak-card" key={script.id}>
            <div className="speak-card-head">
              <span className="speak-badge">내 스크립트</span>
              <span className="morning-meta">
                <span>{formatDay(script.updatedAt)} 수정</span>
              </span>
            </div>
            <h3 className="myscript-title">{script.title}</h3>
            {script.question && (
              <p className="speak-q" lang="en">
                {script.question}
              </p>
            )}

            <div className="speak-row speak-row-tight">
              <SpeakButton
                playKey={`${script.id}:a`}
                segments={[{ text: script.answer }]}
                label="내 스크립트 듣기"
                size="sm"
                tone="line"
              />
              <button type="button" className="speak-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : script.id)}>
                {open ? '접기 ▲' : '문장별·녹음 ▼'}
              </button>
            </div>

            {open && (
              <div className="speak-answer">
                <div className="sent-list" lang="en">
                  {sentences.map((sentence, i) => (
                    <div className="sent-row" key={`${script.id}-s${i}`}>
                      <SpeechChip playKey={`${script.id}:s${i}`} text={sentence} />
                      <span>{sentence}</span>
                    </div>
                  ))}
                </div>
                {script.note && <p className="myscript-note">{script.note}</p>}
                <RecorderBar />
              </div>
            )}

            <div className="speak-row speak-row-tight">
              <button
                type="button"
                className="rec-mini"
                onClick={() =>
                  setDraft({
                    id: script.id,
                    title: script.title,
                    question: script.question,
                    answer: script.answer,
                    note: script.note,
                  })
                }
              >
                수정
              </button>
              <button type="button" className="rec-mini rec-del" onClick={() => remove(script)}>
                삭제
              </button>
            </div>
          </article>
        );
      })}

      {draft &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setDraft(null)}>
            <div
              className="sheet speak-editor"
              role="dialog"
              aria-modal="true"
              aria-label={draft.id ? '스크립트 수정' : '새 스크립트'}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sheet-grab" />
              <div className="toss-head">
                <h3 className="sheet-title">{draft.id ? '스크립트 수정' : '새 스크립트'}</h3>
                <button type="button" className="icon-btn" onClick={() => setDraft(null)} aria-label="닫기">
                  ✕
                </button>
              </div>

              <label className="speak-field">
                <span>제목</span>
                <input
                  className="sheet-input"
                  value={draft.title}
                  onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                  placeholder="예: 돌발 · 날씨가 안 좋을 때"
                  maxLength={80}
                />
              </label>

              <label className="speak-field">
                <span>영어 질문 (선택)</span>
                <textarea
                  className="sheet-input sheet-textarea"
                  value={draft.question}
                  onChange={(e) => setDraft({ ...draft, question: e.target.value })}
                  placeholder="What do you usually do on rainy days?"
                  rows={2}
                  lang="en"
                />
              </label>

              <label className="speak-field">
                <span>영어 답변 · 스크립트</span>
                <textarea
                  className="sheet-input sheet-textarea"
                  value={draft.answer}
                  onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
                  placeholder="Usually I stay home and listen to music. If I have to go out, I take the bus instead of walking."
                  rows={5}
                  lang="en"
                />
              </label>

              <label className="speak-field">
                <span>메모 (선택)</span>
                <textarea
                  className="sheet-input sheet-textarea"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  placeholder="외울 표현, 주의할 발음 등"
                  rows={2}
                />
              </label>

              <div className="sheet-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setDraft(null)}>
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={!draft.title.trim() || (!draft.answer.trim() && !draft.question.trim())}
                  onClick={saveDraft}
                >
                  저장
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
