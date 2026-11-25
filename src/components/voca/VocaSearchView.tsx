import { useMemo, useState } from 'react';
import { normalizeSearch, speakEnglish, type VocaData, type VocaWord } from '../../lib/voca';
import type { VocaProgressStore } from '../../hooks/useVocaProgress';
import { VocaRow } from './VocaBits';

type Mode = 'stats' | 'fav' | 'wrong';

const MAX_RESULTS = 120;

type Props = {
  data: VocaData;
  voca: VocaProgressStore;
  showToast: (text: string) => void;
};

export default function VocaSearchView({ data, voca, showToast }: Props) {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Mode>('stats');
  const [revealed, setRevealed] = useState<Set<number>>(() => new Set());

  const query = q.trim();

  const index = useMemo(
    () =>
      data.words.map((w) => ({
        w,
        word: normalizeSearch(w.word),
        meaning: normalizeSearch(w.meaning),
      })),
    [data.words],
  );

  const results = useMemo(() => {
    if (!query) return [];
    const target = normalizeSearch(query);
    const out: VocaWord[] = [];
    for (const row of index) {
      if (row.word.includes(target) || row.meaning.includes(target)) {
        out.push(row.w);
        if (out.length >= MAX_RESULTS) break;
      }
    }
    return out;
  }, [index, query]);

  const partStats = useMemo(
    () =>
      data.parts.map((p) => {
        const words = data.words.filter((w) => w.part === p.index);
        let known = 0;
        for (const w of words) if (voca.known.has(w.i)) known += 1;
        return { part: p, total: words.length, known, pct: words.length ? Math.round((known / words.length) * 100) : 0 };
      }),
    [data, voca.known],
  );

  const knownTotal = voca.known.size;
  const overallPct = data.count ? Math.round((knownTotal / data.count) * 100) : 0;

  const favWords = useMemo(() => data.words.filter((w) => voca.favorites.has(w.i)), [data.words, voca.favorites]);
  const wrongWords = useMemo(() => data.words.filter((w) => voca.wrong.has(w.i)), [data.words, voca.wrong]);

  const listWords = mode === 'fav' ? favWords : mode === 'wrong' ? wrongWords : [];

  const speak = (text: string) => {
    if (!speakEnglish(text)) showToast('이 브라우저에서는 발음을 들려줄 수 없어요');
  };

  const reveal = (id: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });

  const resetProgress = () => {
    if (!window.confirm('단어장 학습 기록(외움·즐겨찾기·오답)을 모두 지울까요? 되돌릴 수 없어요.')) return;
    voca.reset();
    showToast('단어장 기록을 초기화했어요');
  };

  return (
    <>
      <div className="voca-search">
        <span className="voca-search-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" />
          </svg>
        </span>
        <input
          type="search"
          value={q}
          placeholder="영단어·한국어 뜻 검색 (5,101개)"
          onChange={(e) => setQ(e.target.value)}
          aria-label="단어 검색"
        />
        {q && (
          <button className="voca-search-clear" onClick={() => setQ('')} aria-label="검색어 지우기">
            ✕
          </button>
        )}
      </div>

      {query ? (
        <>
          <div className="section-title">
            <h2>검색 결과</h2>
            <span className="hint num">
              {results.length >= MAX_RESULTS ? `${MAX_RESULTS}+` : results.length}개
            </span>
          </div>
          {results.length === 0 ? (
            <div className="card empty">'{q.trim()}'에 맞는 단어가 없어요</div>
          ) : (
            <ul className="voca-list compact">
              {results.map((w) => (
                <VocaRow
                  key={w.i}
                  word={w}
                  partLabel={data.parts[w.part]?.label}
                  revealed={revealed.has(w.i)}
                  onReveal={() => reveal(w.i)}
                  known={voca.known.has(w.i)}
                  favorite={voca.favorites.has(w.i)}
                  onToggleKnown={() => voca.toggleKnown(w.i)}
                  onToggleFavorite={() => voca.toggleFavorite(w.i)}
                  onSpeak={() => speak(w.word)}
                />
              ))}
            </ul>
          )}
          {results.length >= MAX_RESULTS && <p className="hint center">검색어를 더 자세히 입력해 보세요</p>}
        </>
      ) : (
        <>
          <div className="card voca-overall">
            <div className="voca-overall-top">
              <div>
                <p className="voca-summary-k">전체 외운 단어</p>
                <p className="voca-overall-v num">
                  {knownTotal.toLocaleString('ko-KR')}
                  <small> / {data.count.toLocaleString('ko-KR')}</small>
                </p>
              </div>
              <span className={`voca-pct num${overallPct === 100 ? ' full' : ''}`}>{overallPct}%</span>
            </div>
            <div className="voca-bar big" aria-hidden="true">
              <span style={{ width: `${overallPct}%` }} />
            </div>
            <p className="hint">{data.source} · DAY 01~30 · 4개 파트</p>
          </div>

          <div className="voca-mini-row">
            <button className="voca-mini-card" aria-pressed={mode === 'fav'} onClick={() => setMode('fav')}>
              <span className="k">즐겨찾기</span>
              <span className="v num">{favWords.length}</span>
            </button>
            <button className="voca-mini-card" aria-pressed={mode === 'wrong'} onClick={() => setMode('wrong')}>
              <span className="k">오답노트</span>
              <span className="v num">{wrongWords.length}</span>
            </button>
          </div>

          {mode !== 'stats' && (
            <>
              <div className="section-title">
                <h2>{mode === 'fav' ? '즐겨찾기 단어' : '오답노트'}</h2>
                <span className="hint num">{listWords.length}개</span>
              </div>
              {listWords.length === 0 ? (
                <div className="card empty">
                  {mode === 'fav' ? '아직 즐겨찾기한 단어가 없어요' : '틀린 단어가 아직 없어요'}
                </div>
              ) : (
                <ul className="voca-list compact">
                  {listWords.map((w) => (
                    <VocaRow
                      key={w.i}
                      word={w}
                      partLabel={data.parts[w.part]?.label}
                      revealed={revealed.has(w.i)}
                      onReveal={() => reveal(w.i)}
                      known={voca.known.has(w.i)}
                      favorite={voca.favorites.has(w.i)}
                      onToggleKnown={() => voca.toggleKnown(w.i)}
                      onToggleFavorite={() => voca.toggleFavorite(w.i)}
                      onSpeak={() => speak(w.word)}
                    />
                  ))}
                </ul>
              )}
            </>
          )}

          <div className="section-title">
            <h2>파트별 달성률</h2>
            <span className="hint">외운 단어 기준</span>
          </div>
          <div className="card voca-part-stats">
            {partStats.map((row) => (
              <div className="voca-part-row" key={row.part.id}>
                <div className="voca-part-top">
                  <span className="nm">{row.part.name}</span>
                  <span className="vl num">
                    {row.known} / {row.total}
                  </span>
                  <span className="pc num">{row.pct}%</span>
                </div>
                <div className="voca-bar" aria-hidden="true">
                  <span style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          <p className="hint center">
            학습 기록은 이 기기에 저장되고, 설정 탭의 JSON 백업에 단어장 기록도 함께 담겨요
          </p>
          <button className="btn btn-ghost btn-sm voca-reset" onClick={resetProgress}>
            단어장 기록 초기화
          </button>
        </>
      )}
    </>
  );
}
