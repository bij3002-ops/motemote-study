import { useEffect, useRef, useState } from 'react';
import { useToast } from '../hooks/useToast';
import { useVocaData, useVocaProgress } from '../hooks/useVocaProgress';
import VocaCardsView from './voca/VocaCardsView';
import VocaListView from './voca/VocaListView';
import VocaQuizView from './voca/VocaQuizView';
import VocaSearchView from './voca/VocaSearchView';

type View = 'list' | 'cards' | 'quiz' | 'search';

const VIEWS: Array<{ key: View; label: string }> = [
  { key: 'list', label: '단어장' },
  { key: 'cards', label: '카드' },
  { key: 'quiz', label: '퀴즈' },
  { key: 'search', label: '검색·오답' },
];

export default function VocaTab() {
  const { data, error, loading, retry } = useVocaData();
  const voca = useVocaProgress();
  const [toast, showToast] = useToast();
  const [view, setView] = useState<View>('list');
  const [part, setPart] = useState(voca.progress.last.part);
  const [day, setDay] = useState(voca.progress.last.day);

  // 마지막으로 보던 파트·DAY를 기억한다.
  const setLastRef = useRef(voca.setLast);
  setLastRef.current = voca.setLast;
  useEffect(() => {
    setLastRef.current(part, day);
  }, [part, day]);

  const knownTotal = voca.known.size;

  return (
    <main className="screen voca-screen">
      {toast}
      <header className="topbar">
        <div>
          <p className="eyebrow">TOEIC VOCA · 해커스 노랭이</p>
          <h1 className="title">단어장</h1>
        </div>
        {data && (
          <div className="topbar-right">
            <span className="voca-head-count num">
              {knownTotal.toLocaleString('ko-KR')}
              <small> / {data.count.toLocaleString('ko-KR')}</small>
            </span>
          </div>
        )}
      </header>

      <div className="seg voca-view-seg" role="tablist" aria-label="단어장 화면">
        {VIEWS.map((v) => (
          <button
            key={v.key}
            role="tab"
            aria-selected={view === v.key}
            aria-pressed={view === v.key}
            onClick={() => setView(v.key)}
          >
            {v.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="card voca-loading">
          <span className="voca-spinner" aria-hidden="true" />
          <p>단어 5,101개를 불러오는 중…</p>
          <span className="hint">처음 한 번만 내려받고, 다음부터는 바로 열려요</span>
        </div>
      )}

      {error && (
        <div className="card voca-loading">
          <p>{error}</p>
          <button className="btn btn-line btn-sm" onClick={retry}>
            다시 시도
          </button>
        </div>
      )}

      {data && (
        <>
          {view === 'list' && (
            <VocaListView data={data} part={part} day={day} onPart={setPart} onDay={setDay} voca={voca} showToast={showToast} />
          )}
          {view === 'cards' && (
            <VocaCardsView data={data} part={part} day={day} voca={voca} showToast={showToast} />
          )}
          {view === 'quiz' && (
            <VocaQuizView data={data} part={part} day={day} voca={voca} showToast={showToast} />
          )}
          {view === 'search' && <VocaSearchView data={data} voca={voca} showToast={showToast} />}
        </>
      )}
    </main>
  );
}
