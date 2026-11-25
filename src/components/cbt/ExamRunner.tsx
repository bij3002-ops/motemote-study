import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNow } from '../../hooks/useNow';
import { formatClock, type CbtDraft, type RoundData } from '../../lib/cbt';
import QuestionView from './QuestionView';

type Props = {
  data: RoundData;
  draft: CbtDraft;
  onChange: (next: CbtDraft) => void;
  onSubmit: () => void;
  onExit: () => void;
  isStarred: (n: number) => boolean;
  onStar: (n: number) => void;
  showToast: (text: string) => void;
};

export default function ExamRunner({ data, draft, onChange, onSubmit, onExit, isStarred, onStar, showToast }: Props) {
  const list = useMemo(
    () => (draft.scope === 'full' ? data.questions : data.questions.filter((q) => q.subject === draft.scope)),
    [data, draft.scope],
  );
  const total = list.length;
  const idx = Math.min(Math.max(0, list.findIndex((q) => q.n === draft.current)), Math.max(0, total - 1));
  const q = list[idx];
  const now = useNow(500);
  const remain = Math.max(0, Math.round((draft.deadline - now) / 1000));
  const [gridOpen, setGridOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submittedRef = useRef(false);

  const answeredCount = list.filter((item) => draft.answers[String(item.n)] != null).length;

  useEffect(() => {
    if (remain <= 0 && !submittedRef.current) {
      submittedRef.current = true;
      showToast('시험 시간이 끝나 자동 제출했어요');
      onSubmit();
    }
  }, [remain, onSubmit, showToast]);

  if (!q) return null;

  const select = (value: number) => {
    onChange({ ...draft, answers: { ...draft.answers, [String(q.n)]: value } });
  };
  const go = (n: number) => {
    onChange({ ...draft, current: n });
    setGridOpen(false);
  };

  return (
    <main className="screen cbt-screen cbt-runner">
      <header className="cbt-run-head">
        <button type="button" className="icon-btn" onClick={onExit} aria-label="시험 나가기">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <div className="cbt-run-title">
          <span className="cbt-run-round">{data.examName} · {data.label}</span>
          <span className="cbt-run-scope">
            {draft.scope === 'full' ? '전체 100문항' : `${data.subjects[(draft.scope as number) - 1]} 20문항`} · 응답 {answeredCount}/{total}
          </span>
        </div>
        <div className={`cbt-timer num${remain <= 300 ? ' urgent' : ''}`} aria-live="off">
          <span>{formatClock(remain)}</span>
          <small>남은 시간</small>
        </div>
      </header>

      <QuestionView
        q={q}
        subjectName={data.subjects[q.subject - 1] ?? ''}
        selected={draft.answers[String(q.n)] ?? null}
        onSelect={select}
        starred={isStarred(q.n)}
        onStar={() => onStar(q.n)}
      />

      <div className="cbt-run-foot">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={idx === 0}
          onClick={() => go(list[idx - 1].n)}
        >
          이전
        </button>
        <button type="button" className="btn btn-ghost btn-sm cbt-grid-btn" onClick={() => setGridOpen(true)}>
          <span className="num">{idx + 1}</span> / {total} · 번호
        </button>
        {idx === total - 1 ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setConfirmOpen(true)}>
            제출
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => go(list[idx + 1].n)}>
            다음
          </button>
        )}
      </div>

      {gridOpen &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setGridOpen(false)}>
            <div className="sheet cbt-grid-sheet" role="dialog" aria-modal="true" aria-label="문제 번호" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-grab" />
              <h3 className="sheet-title">문제 번호</h3>
              <p className="sheet-sub">
                응답 {answeredCount} · 남음 {total - answeredCount}
              </p>
              <div className="cbt-grid">
                {list.map((item) => {
                  const answered = draft.answers[String(item.n)] != null;
                  return (
                    <button
                      key={item.n}
                      type="button"
                      className={`cbt-grid-cell num${answered ? ' answered' : ''}${item.n === q.n ? ' current' : ''}`}
                      onClick={() => go(item.n)}
                    >
                      {item.n}
                    </button>
                  );
                })}
              </div>
              <div className="sheet-actions">
                <button type="button" className="btn btn-primary" onClick={() => { setGridOpen(false); setConfirmOpen(true); }}>
                  채점하고 제출하기
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {confirmOpen &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setConfirmOpen(false)}>
            <div className="sheet" role="dialog" aria-modal="true" aria-label="제출 확인" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-grab" />
              <h3 className="sheet-title">답안을 제출할까요?</h3>
              <p className="sheet-sub">
                응답 {answeredCount}문항 · 남은 {total - answeredCount}문항
                {total - answeredCount > 0 ? ' (빈 문항은 오답 처리돼요)' : ''}
              </p>
              <div className="sheet-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmOpen(false)}>
                  계속 풀기
                </button>
                <button type="button" className="btn btn-primary" onClick={onSubmit}>
                  제출하기
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
