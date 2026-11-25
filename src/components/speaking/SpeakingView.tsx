import { useEffect, useState } from 'react';
import { usePlayer } from '../../hooks/usePlayer';
import {
  loadSpeakingData,
  loadSpeakingStore,
  readMode,
  saveSpeakingStore,
  SPEAKING_MODE_KEY,
  writeMode,
  type SpeakingData,
} from '../../lib/speaking';
import { speakingPlayer } from '../../lib/tts';
import { StopButton, SpeedChips } from './PlayButtons';
import MorningView from './MorningView';
import MyScriptsView from './MyScriptsView';
import OpicView from './OpicView';
import ToeicView from './ToeicView';

type Mode = 'opic' | 'toeic' | 'morning' | 'mine';

const MODES: Array<{ key: Mode; label: string }> = [
  { key: 'opic', label: '오픽' },
  { key: 'toeic', label: '토스' },
  { key: 'morning', label: '모닝콜' },
  { key: 'mine', label: '내 스크립트' },
];

export default function SpeakingView() {
  const [mode, setMode] = useState<Mode>(() =>
    readMode(SPEAKING_MODE_KEY, ['opic', 'toeic', 'morning', 'mine'] as const, 'opic'),
  );
  const changeMode = (next: Mode) => {
    setMode(next);
    writeMode(SPEAKING_MODE_KEY, next);
  };
  const [data, setData] = useState<SpeakingData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const { rate } = usePlayer();

  // 마지막으로 고른 속도를 기억한다.
  useEffect(() => {
    const stored = loadSpeakingStore();
    if (Math.abs(stored.rate - speakingPlayer.getSnapshot().rate) > 0.001) speakingPlayer.setRate(stored.rate);
    // 처음 한 번만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stored = loadSpeakingStore();
    if (Math.abs(stored.rate - rate) > 0.001) saveSpeakingStore({ ...stored, rate });
  }, [rate]);

  useEffect(() => {
    if (mode === 'mine' || data) return;
    let alive = true;
    setLoading(true);
    setError(null);
    loadSpeakingData()
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((err: Error) => {
        if (alive) setError(err.message || '말하기 데이터를 불러오지 못했어요');
      })
      .finally(() => {
        // data가 채워지며 effect가 정리돼도 로딩 표시는 반드시 내린다.
        setLoading(false);
      });
    return () => {
      alive = false;
    };
    // data가 채워지면 다시 요청하지 않는다. 실패 후 '다시 시도'는 attempt를 올려 재요청한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, data, attempt]);

  return (
    <div className="speak-wrap">
      <div className="seg speak-mode-seg" role="tablist" aria-label="말하기 종류">
        {MODES.map((m) => (
          <button
            key={m.key}
            role="tab"
            aria-selected={mode === m.key}
            aria-pressed={mode === m.key}
            onClick={() => changeMode(m.key)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="speak-toolbar">
        <div>
          <p className="speak-tool-label">재생 속도</p>
          <SpeedChips />
        </div>
        <StopButton />
      </div>

      {loading && (
        <div className="card voca-loading">
          <span className="voca-spinner" aria-hidden="true" />
          <p>말하기 콘텐츠를 불러오는 중…</p>
          <span className="hint">오픽 17주제 · 토스 Part 1~5 · 모닝콜 복습을 한 번에 받아와요</span>
        </div>
      )}

      {error && !loading && (
        <div className="card voca-loading">
          <p>{error}</p>
          <button
            className="btn btn-line btn-sm"
            onClick={() => {
              setError(null);
              setData(null);
              setAttempt((n) => n + 1);
            }}
          >
            다시 시도
          </button>
        </div>
      )}

      {mode === 'mine' && <MyScriptsView />}
      {mode !== 'mine' && data && (
        <>
          {mode === 'opic' && <OpicView data={data} />}
          {mode === 'toeic' && <ToeicView data={data} />}
          {mode === 'morning' && <MorningView data={data} />}
        </>
      )}
    </div>
  );
}
