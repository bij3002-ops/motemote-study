import {
  FAIL_LINE,
  formatUsed,
  PASS_SCORE,
  type Attempt,
  type RoundData,
} from '../../lib/cbt';

type Props = {
  data: RoundData;
  attempt: Attempt;
  onHome: () => void;
  onReviewWrong: () => void;
  onRetry: () => void;
};

export default function ResultView({ data, attempt, onHome, onReviewWrong, onRetry }: Props) {
  const full = attempt.scope === 'full';
  const passed = attempt.passed === true;
  const subjectName = !full && typeof attempt.scope === 'number' ? data.subjects[attempt.scope - 1] ?? '' : '';
  const verdict = full ? (passed ? '합격' : '불합격') : `${subjectName} 20문항`;
  const wrongCount = attempt.total - attempt.correct;

  return (
    <main className="screen cbt-screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">{data.examName} · {data.label}</p>
          <h1 className="title">채점 결과</h1>
        </div>
        <div className="topbar-right">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onHome}>
            목록
          </button>
        </div>
      </header>

      <section className={`card cbt-result-hero${full ? (passed ? ' pass' : ' fail') : ''}`}>
        <div className="cbt-result-score">
          <b className="num">{attempt.score}</b>
          <span>점</span>
        </div>
        <div className="cbt-result-verdict">{verdict}</div>
        <p className="cbt-result-meta">
          {full ? `평균 ${PASS_SCORE}점 이상 · 과목별 ${FAIL_LINE}점 이상` : '과목별 20문항 기준 점수예요'}
        </p>
        <div className="cbt-result-stats">
          <div>
            <b className="num">{attempt.correct}</b>
            <span>정답</span>
          </div>
          <div>
            <b className="num">{wrongCount}</b>
            <span>오답</span>
          </div>
          <div>
            <b className="num">{formatUsed(attempt.usedSec)}</b>
            <span>소요</span>
          </div>
        </div>
      </section>

      <section className="card cbt-subjects">
        <h2 className="cbt-block-title">과목별 점수</h2>
        {attempt.subjects.map((row) => (
          <div key={row.subject} className="cbt-subject-row">
            <div className="cbt-subject-top">
              <span className="cbt-subject-name">
                {row.subject}과목 · {row.name}
              </span>
              <span className={`cbt-subject-score num${row.failed ? ' failed' : ''}`}>{row.score}점</span>
            </div>
            <div className="cbt-subject-bar">
              <span style={{ width: `${Math.min(100, row.score)}%` }} className={row.failed ? 'failed' : ''} />
              <i style={{ left: `${FAIL_LINE}%` }} aria-hidden />
            </div>
            <div className="cbt-subject-sub">
              {row.correct}/{row.total}문항
              {row.failed ? <em className="cbt-fail-tag">과락</em> : null}
            </div>
          </div>
        ))}
      </section>

      <div className="cbt-result-actions">
        <button type="button" className="btn btn-primary" onClick={onReviewWrong} disabled={wrongCount === 0}>
          틀린 문제 {wrongCount}개 다시 풀기
        </button>
        <button type="button" className="btn btn-ghost" onClick={onRetry}>
          같은 범위 다시 응시
        </button>
      </div>
    </main>
  );
}
