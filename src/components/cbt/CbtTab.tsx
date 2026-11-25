import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useToast } from '../../hooks/useToast';
import {
  EXAM_SECONDS,
  formatUsed,
  gradeRound,
  loadCbt,
  loadDraft,
  loadIndex,
  loadRound,
  markKey,
  saveCbt,
  saveDraft,
  type Attempt,
  type CbtDraft,
  type CbtIndex,
  type CbtQuestion,
  type CbtSaved,
  type ExamId,
  type ExamMeta,
  type RoundData,
  type RoundMeta,
} from '../../lib/cbt';
import ExamRunner from './ExamRunner';
import PracticeView from './PracticeView';
import ResultView from './ResultView';
import QuestionView from './QuestionView';

type Mode = 'exam' | 'practice' | 'review';
type Running =
  | { kind: 'exam'; data: RoundData; draft: CbtDraft }
  | { kind: 'practice'; data: RoundData; items: CbtQuestion[]; title: string; subtitle?: string };

const MODES: Array<{ key: Mode; label: string }> = [
  { key: 'exam', label: '실전 모의고사' },
  { key: 'practice', label: '바로 풀기' },
  { key: 'review', label: '오답·별표' },
];

export default function CbtTab() {
  const [toast, showToast] = useToast();
  const [index, setIndex] = useState<CbtIndex | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saved, setSaved] = useState<CbtSaved>(() => loadCbt());
  const [exam, setExam] = useState<ExamId>(() => loadCbt().last.exam);
  const [mode, setMode] = useState<Mode>('exam');
  const [sheetRound, setSheetRound] = useState<RoundMeta | null>(null);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState<Running | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);
  const [resultData, setResultData] = useState<RoundData | null>(null);
  const [pendingDraft, setPendingDraft] = useState<CbtDraft | null>(() => {
    const d = loadDraft();
    return d && d.deadline > Date.now() ? d : null;
  });
  const [reviewTab, setReviewTab] = useState<'wrong' | 'star'>('wrong');
  const [peek, setPeek] = useState<{ data: RoundData; item: CbtQuestion } | null>(null);

  useEffect(() => {
    let alive = true;
    loadIndex()
      .then((data) => {
        if (!alive) return;
        setIndex(data);
        const known = data.exams.some((e) => e.id === loadCbt().last.exam);
        if (!known && data.exams[0]) setExam(data.exams[0].id);
      })
      .catch((err: unknown) => {
        if (alive) setLoadError(err instanceof Error ? err.message : '기출 목록을 불러오지 못했어요');
      });
    return () => {
      alive = false;
    };
  }, []);

  const patchSaved = useCallback((fn: (prev: CbtSaved) => CbtSaved) => {
    setSaved((prev) => {
      const next = fn(prev);
      saveCbt(next);
      return next;
    });
  }, []);

  const pickExam = (id: ExamId) => {
    setExam(id);
    patchSaved((prev) => ({ ...prev, last: { ...prev.last, exam: id } }));
  };

  const examMeta: ExamMeta | null = useMemo(
    () => index?.exams.find((e) => e.id === exam) ?? null,
    [index, exam],
  );

  const isStarred = useCallback(
    (round: string, n: number) => Boolean(saved.stars[markKey(exam, round, n)]),
    [saved.stars, exam],
  );

  const toggleStar = useCallback(
    (round: string, n: number) => {
      const k = markKey(exam, round, n);
      patchSaved((prev) => {
        const stars = { ...prev.stars };
        if (stars[k]) delete stars[k];
        else stars[k] = { exam, round, n, at: Date.now() };
        return { ...prev, stars };
      });
    },
    [exam, patchSaved],
  );

  const addWrong = useCallback(
    (round: string, n: number) => {
      const k = markKey(exam, round, n);
      patchSaved((prev) => ({ ...prev, wrong: { ...prev.wrong, [k]: { exam, round, n, at: Date.now() } } }));
    },
    [exam, patchSaved],
  );

  const removeWrong = useCallback(
    (round: string, n: number) => {
      const k = markKey(exam, round, n);
      patchSaved((prev) => {
        if (!prev.wrong[k]) return prev;
        const wrong = { ...prev.wrong };
        delete wrong[k];
        return { ...prev, wrong };
      });
    },
    [exam, patchSaved],
  );

  /* ---------- 시작 ---------- */

  const startExam = async (meta: RoundMeta, scope: 'full' | number) => {
    setSheetRound(null);
    setBusy(true);
    try {
      const data = await loadRound(exam, meta.id);
      const list = scope === 'full' ? data.questions : data.questions.filter((q) => q.subject === scope);
      const startedAt = Date.now();
      // 실전은 100문항 150분, 과목별 20문항은 30분
      const limit = scope === 'full' ? EXAM_SECONDS : 30 * 60;
      const draft: CbtDraft = {
        exam,
        round: meta.id,
        scope,
        answers: {},
        current: list[0]?.n ?? 1,
        startedAt,
        deadline: startedAt + limit * 1000,
      };
      saveDraft(draft);
      setResult(null);
      setRunning({ kind: 'exam', data, draft });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '기출문제를 불러오지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  const startPractice = async (meta: RoundMeta, scope: 'all' | number) => {
    setSheetRound(null);
    setBusy(true);
    try {
      const data = await loadRound(exam, meta.id);
      const items = scope === 'all' ? data.questions : data.questions.filter((q) => q.subject === scope);
      setRunning({
        kind: 'practice',
        data,
        items,
        title: `${data.examName} · ${data.label}`,
        subtitle: scope === 'all' ? '전체 순서대로' : `${data.subjects[scope - 1]} 20문항`,
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '기출문제를 불러오지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  const startReview = async (examId: ExamId, round: string, items: CbtQuestion[]) => {
    setBusy(true);
    try {
      const data = await loadRound(examId, round);
      setPeek(null);
      setRunning({
        kind: 'practice',
        data,
        items,
        title: `${data.examName} · ${data.label}`,
        subtitle: '오답·별표 다시 풀기',
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '기출문제를 불러오지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  const resumeDraft = async () => {
    if (!pendingDraft) return;
    setBusy(true);
    try {
      const data = await loadRound(pendingDraft.exam, pendingDraft.round);
      setExam(pendingDraft.exam);
      setResult(null);
      setRunning({ kind: 'exam', data, draft: pendingDraft });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '기출문제를 불러오지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  /* ---------- 채점 ---------- */

  const submitExam = () => {
    if (!running || running.kind !== 'exam') return;
    const { data, draft } = running;
    const graded = gradeRound(data, draft.answers, draft.scope);
    const endedAt = Date.now();
    const attempt: Attempt = {
      id: `${Date.now()}`,
      exam: draft.exam,
      examName: data.examName,
      round: data.round,
      roundLabel: data.label,
      scope: draft.scope,
      startedAt: draft.startedAt,
      endedAt,
      usedSec: Math.max(1, Math.round((Math.min(endedAt, draft.deadline) - draft.startedAt) / 1000)),
      answers: draft.answers,
      correct: graded.correct,
      total: graded.total,
      score: graded.score,
      subjects: graded.subjects,
      passed: graded.passed,
    };
    patchSaved((prev) => {
      const wrong = { ...prev.wrong };
      for (const q of data.questions) {
        if (draft.scope !== 'full' && q.subject !== draft.scope) continue;
        if (draft.answers[String(q.n)] !== q.answer) {
          wrong[markKey(draft.exam, data.round, q.n)] = { exam: draft.exam, round: data.round, n: q.n, at: endedAt };
        }
      }
      return { ...prev, attempts: [attempt, ...prev.attempts].slice(0, 60), wrong };
    });
    saveDraft(null);
    setPendingDraft(null);
    setResultData(data);
    setResult(attempt);
    setRunning(null);
  };

  const retrySameScope = () => {
    if (!result) return;
    const meta = examMeta?.rounds.find((r) => r.id === result.round);
    if (meta) startExam(meta, result.scope);
  };

  /* ---------- 화면 ---------- */

  if (running?.kind === 'exam') {
    return (
      <>
        {toast}
        <ExamRunner
          data={running.data}
          draft={running.draft}
          onChange={(next) => {
            saveDraft(next);
            setRunning({ ...running, draft: next });
          }}
          onSubmit={submitExam}
          onExit={() => {
            saveDraft(running.draft);
            setPendingDraft(running.draft);
            setRunning(null);
            showToast('나가도 답안은 저장돼 있어요');
          }}
          isStarred={(n) => isStarred(running.data.round, n)}
          onStar={(n) => toggleStar(running.data.round, n)}
          showToast={showToast}
        />
      </>
    );
  }

  if (running?.kind === 'practice') {
    return (
      <>
        {toast}
        <PracticeView
          data={running.data}
          items={running.items}
          title={running.title}
          subtitle={running.subtitle}
          onExit={() => setRunning(null)}
          isStarred={(n) => isStarred(running.data.round, n)}
          onStar={(n) => toggleStar(running.data.round, n)}
          onGraded={(q, correct) => {
            if (correct) removeWrong(running.data.round, q.n);
            else addWrong(running.data.round, q.n);
          }}
        />
      </>
    );
  }

  if (result && resultData) {
    const wrongItems = resultData.questions.filter(
      (q) =>
        (result.scope === 'full' || q.subject === result.scope) &&
        result.answers[String(q.n)] !== q.answer,
    );
    return (
      <>
        {toast}
        <ResultView
          data={resultData}
          attempt={result}
          onHome={() => {
            setResult(null);
            setResultData(null);
          }}
          onRetry={retrySameScope}
          onReviewWrong={() => {
            if (wrongItems.length === 0) {
              showToast('틀린 문제가 없어요');
              return;
            }
            setRunning({
              kind: 'practice',
              data: resultData,
              items: wrongItems,
              title: `${resultData.examName} · ${resultData.label}`,
              subtitle: '이번 응시 오답',
            });
            setResult(null);
            setResultData(null);
          }}
        />
      </>
    );
  }

  /* ---------- 오답·별표 ---------- */

  const markList = reviewTab === 'wrong' ? saved.wrong : saved.stars;
  const marked = Object.values(markList).filter((m) => m.exam === exam);
  const grouped = new Map<string, number[]>();
  for (const m of marked) {
    const arr = grouped.get(m.round) ?? [];
    arr.push(m.n);
    grouped.set(m.round, arr);
  }
  const reviewRounds = [...grouped.entries()]
    .map(([round, nums]) => ({
      round,
      nums: nums.sort((a, b) => a - b),
      meta: examMeta?.rounds.find((r) => r.id === round),
    }))
    .sort((a, b) => (a.round < b.round ? 1 : -1));

  const openReviewGroup = async (round: string, nums: number[]) => {
    setBusy(true);
    try {
      const data = await loadRound(exam, round);
      const items = nums.map((n) => data.questions.find((q) => q.n === n)).filter((q): q is CbtQuestion => Boolean(q));
      if (items.length === 0) {
        showToast('문제를 찾지 못했어요');
        return;
      }
      setRunning({
        kind: 'practice',
        data,
        items,
        title: `${data.examName} · ${data.label}`,
        subtitle: reviewTab === 'wrong' ? '오답 다시 풀기' : '별표 다시 풀기',
      });
    } catch (err) {
      showToast(err instanceof Error ? err.message : '기출문제를 불러오지 못했어요');
    } finally {
      setBusy(false);
    }
  };

  const recentAttempts = saved.attempts.filter((a) => a.exam === exam).slice(0, 3);

  return (
    <main className="screen cbt-screen">
      {toast}
      <header className="topbar">
        <div>
          <p className="eyebrow">기출문제 · CBT</p>
          <h1 className="title">기출 CBT</h1>
        </div>
        <div className="topbar-right">
          <span className="cbt-head-count num">
            {saved.attempts.filter((a) => a.exam === exam).length}
            <small>회 응시</small>
          </span>
        </div>
      </header>

      <div className="seg cbt-exam-seg" role="tablist" aria-label="자격증 선택">
        {(index?.exams ?? []).map((e) => (
          <button
            key={e.id}
            role="tab"
            aria-selected={exam === e.id}
            aria-pressed={exam === e.id}
            onClick={() => pickExam(e.id)}
          >
            {e.name}
          </button>
        ))}
      </div>

      <div className="seg cbt-mode-seg" role="tablist" aria-label="학습 모드">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            aria-pressed={mode === m.key}
            onClick={() => setMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="card info-text">
          {loadError}
          <br />
          잠시 뒤 다시 열어 주세요.
        </div>
      )}

      {!index && !loadError && <div className="card info-text">기출 목록을 불러오는 중…</div>}

      {pendingDraft && index && (
        <div className="card cbt-resume">
          <div>
            <b>풀던 모의고사가 있어요</b>
            <p>
              {index.exams.find((e) => e.id === pendingDraft.exam)?.name} ·{' '}
              {index.exams.find((e) => e.id === pendingDraft.exam)?.rounds.find((r) => r.id === pendingDraft.round)?.label ?? pendingDraft.round}
              {' · '}응답 {Object.keys(pendingDraft.answers).length}문항
            </p>
          </div>
          <div className="cbt-resume-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={resumeDraft} disabled={busy}>
              이어서
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => {
                saveDraft(null);
                setPendingDraft(null);
                showToast('풀던 답안을 지웠어요');
              }}
            >
              버리기
            </button>
          </div>
        </div>
      )}

      {index && mode !== 'review' && examMeta && (
        <section className="cbt-rounds">
          <div className="section-title">
            <h2>회차 선택</h2>
            <span className="hint">{mode === 'exam' ? '최근 공개 기출 5회' : '문항을 고르면 바로 채점'}</span>
          </div>
          {examMeta.rounds.map((r) => (
            <button key={r.id} type="button" className="card cbt-round" onClick={() => setSheetRound(r)}>
              <div className="cbt-round-main">
                <b>{r.label}</b>
                <span className="cbt-round-meta">
                  {r.date} · {r.count}문항
                  {r.explanations > 0 ? ' · 해설 있음' : ''}
                </span>
              </div>
              <span className="cbt-round-go" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          ))}
        </section>
      )}

      {index && mode === 'review' && (
        <section className="cbt-review">
          <div className="seg cbt-review-seg" role="tablist" aria-label="오답·별표">
            <button aria-pressed={reviewTab === 'wrong'} onClick={() => setReviewTab('wrong')}>
              오답노트 {Object.values(saved.wrong).filter((m) => m.exam === exam).length}
            </button>
            <button aria-pressed={reviewTab === 'star'} onClick={() => setReviewTab('star')}>
              별표 {Object.values(saved.stars).filter((m) => m.exam === exam).length}
            </button>
          </div>

          {reviewRounds.length === 0 && (
            <div className="card info-text">
              {reviewTab === 'wrong'
                ? '아직 틀린 문제가 없어요. 모의고사를 보거나 바로 풀기를 하면 틀린 문제가 자동으로 쌓여요.'
                : '문제 카드 오른쪽 별표를 누르면 여기에 모여요.'}
            </div>
          )}

          {reviewRounds.map(({ round, nums, meta }) => (
            <div key={round} className="card cbt-review-round">
              <div className="cbt-review-head">
                <div>
                  <b>{meta?.label ?? round}</b>
                  <span>{nums.length}문항</span>
                </div>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => openReviewGroup(round, nums)} disabled={busy}>
                  다시 풀기
                </button>
              </div>
              <div className="cbt-review-nums">
                {nums.map((n) => (
                  <button
                    key={n}
                    type="button"
                    className="cbt-mini-num num"
                    onClick={async () => {
                      try {
                        const data = await loadRound(exam, round);
                        const item = data.questions.find((q) => q.n === n);
                        if (item) setPeek({ data, item });
                      } catch {
                        showToast('문제를 불러오지 못했어요');
                      }
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {recentAttempts.length > 0 && (
        <section className="card cbt-history">
          <h2 className="cbt-block-title">최근 응시</h2>
          {recentAttempts.map((a) => (
            <div key={a.id} className="cbt-history-row">
              <div>
                <b>
                  {a.roundLabel} · {a.scope === 'full' ? '전체' : `${a.scope}과목`}
                </b>
                <span>
                  {new Date(a.endedAt).toLocaleDateString('ko-KR')} · {formatUsed(a.usedSec)} · 정답 {a.correct}/{a.total}
                </span>
              </div>
              <span className={`cbt-history-score num${a.passed === true ? ' pass' : a.passed === false ? ' fail' : ''}`}>
                {a.score}점
              </span>
            </div>
          ))}
        </section>
      )}

      {sheetRound &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setSheetRound(null)}>
            <div className="sheet cbt-scope-sheet" role="dialog" aria-modal="true" aria-label="범위 선택" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-grab" />
              <h3 className="sheet-title">
                {examMeta?.name} {sheetRound.label}
              </h3>
              <p className="sheet-sub">
                {sheetRound.date} · {sheetRound.count}문항
                {sheetRound.explanations > 0 ? ' · 해설 있음' : ' · 해설 없음(정답만)'}
              </p>

              {mode === 'exam' ? (
                <>
                  <button type="button" className="cbt-scope-btn" onClick={() => startExam(sheetRound, 'full')} disabled={busy}>
                    <b>전체 100문항</b>
                    <span>150분 · 과목별 과락 포함 실전 채점</span>
                  </button>
                  <p className="cbt-scope-label">과목별로 20문항만</p>
                  <div className="cbt-scope-grid">
                    {(examMeta?.subjects ?? []).map((name, i) => (
                      <button key={name} type="button" onClick={() => startExam(sheetRound, i + 1)} disabled={busy}>
                        <b className="num">{i + 1}</b>
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <button type="button" className="cbt-scope-btn" onClick={() => startPractice(sheetRound, 'all')} disabled={busy}>
                    <b>전체 순서대로</b>
                    <span>100문항 · 고르면 바로 정답과 해설</span>
                  </button>
                  <p className="cbt-scope-label">과목만 골라서</p>
                  <div className="cbt-scope-grid">
                    {(examMeta?.subjects ?? []).map((name, i) => (
                      <button key={name} type="button" onClick={() => startPractice(sheetRound, i + 1)} disabled={busy}>
                        <b className="num">{i + 1}</b>
                        {name}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}

      {peek &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setPeek(null)}>
            <div className="sheet cbt-peek-sheet" role="dialog" aria-modal="true" aria-label="문제 미리보기" onClick={(e) => e.stopPropagation()}>
              <div className="sheet-grab" />
              <div className="cbt-peek-head">
                <h3 className="sheet-title">
                  {peek.data.label} · {peek.item.n}번
                </h3>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPeek(null)}>
                  닫기
                </button>
              </div>
              <div className="cbt-peek-body">
                <QuestionView
                  q={peek.item}
                  subjectName={peek.data.subjects[peek.item.subject - 1] ?? ''}
                  revealed
                  compact
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </main>
  );
}
