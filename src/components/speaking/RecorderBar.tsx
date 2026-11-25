import { useEffect, useRef, useState } from 'react';
import { formatClock } from '../../lib/speaking';

type RecState = 'idle' | 'recording' | 'ready' | 'error';

const MIME_CANDIDATES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];

function pickMime(): string | null {
  if (typeof MediaRecorder === 'undefined') return null;
  for (const type of MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch {
      /* 다음 후보 */
    }
  }
  return null;
}

function micErrorText(err: unknown): string {
  const name = (err as { name?: string })?.name ?? '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError') {
    return '마이크 사용이 막혀 있어요. 아이폰은 설정 › Safari › 마이크에서 허용한 뒤 다시 눌러 주세요.';
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return '마이크를 찾지 못했어요. 기기에 마이크가 연결되어 있는지 확인해 주세요.';
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return '다른 앱이 마이크를 쓰고 있는 것 같아요. 통화·녹음 앱을 닫고 다시 시도해 주세요.';
  }
  return '녹음을 시작하지 못했어요. 잠시 뒤 다시 시도해 주세요.';
}

/**
 * 내 목소리 녹음 → 바로 다시 듣기.
 * iOS Safari는 audio/mp4, 그 외는 audio/webm을 우선 사용한다.
 * 녹음은 메모리에만 있고(새로고침하면 사라짐) 서버로 보내지 않는다.
 */
export default function RecorderBar({ hint = true }: { hint?: boolean }) {
  const supported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';
  const [state, setState] = useState<RecState>('idle');
  const [seconds, setSeconds] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [message, setMessage] = useState('');

  const recRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const releaseUrl = () => {
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
      releaseUrl();
    };
  }, []);

  const start = async () => {
    if (!supported) {
      setState('error');
      setMessage('이 브라우저는 녹음을 지원하지 않아요. 아이폰 Safari 최신 버전에서 열어 주세요.');
      return;
    }
    setMessage('');
    audioRef.current?.pause();
    setPlaying(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = pickMime();
      const recorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        clearTimer();
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        const type = recorder.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        releaseUrl();
        const nextUrl = URL.createObjectURL(blob);
        urlRef.current = nextUrl;
        setUrl(nextUrl);
        setDuration(Math.max(1, Math.round((Date.now() - startedRef.current) / 1000)));
        setState('ready');
        setPlaying(false);
      };
      recRef.current = recorder;
      startedRef.current = Date.now();
      recorder.start();
      setSeconds(0);
      setState('recording');
      clearTimer();
      timerRef.current = window.setInterval(() => {
        setSeconds(Math.floor((Date.now() - startedRef.current) / 1000));
      }, 200);
    } catch (err) {
      setState('error');
      setMessage(micErrorText(err));
    }
  };

  const stop = () => {
    const recorder = recRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  const reset = () => {
    audioRef.current?.pause();
    setPlaying(false);
    releaseUrl();
    setUrl(null);
    setDuration(0);
    setSeconds(0);
    setState('idle');
    setMessage('');
  };

  const togglePlay = () => {
    if (!url) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setPlaying(false);
    }
    const audio = audioRef.current;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    if (audio.src !== url) audio.src = url;
    audio.currentTime = 0;
    void audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
  };

  return (
    <div className={`rec-bar${state === 'recording' ? ' is-rec' : ''}`}>
      {state === 'idle' && (
        <>
          <button type="button" className="rec-btn" onClick={() => void start()}>
            <span aria-hidden="true">🎙</span> 내 목소리 녹음
          </button>
          {hint && <span className="rec-hint">내 답변을 녹음하고 바로 들어 보세요 · 기기에만 저장돼요</span>}
        </>
      )}

      {state === 'recording' && (
        <>
          <button type="button" className="rec-btn rec-stop" onClick={stop}>
            <span className="rec-dot" aria-hidden="true" /> 정지
          </button>
          <span className="rec-time num">{formatClock(seconds)}</span>
          <span className="rec-hint">녹음 중… 다 읽었으면 정지를 누르세요</span>
        </>
      )}

      {state === 'ready' && url && (
        <>
          <button type="button" className={`rec-btn${playing ? ' rec-stop' : ''}`} onClick={togglePlay}>
            <span aria-hidden="true">{playing ? '■' : '▶'}</span> 내 녹음 {formatClock(duration)}
          </button>
          <button type="button" className="rec-mini" onClick={() => void start()}>
            다시 녹음
          </button>
          <button type="button" className="rec-mini rec-del" onClick={reset}>
            삭제
          </button>
        </>
      )}

      {state === 'error' && (
        <>
          <p className="rec-error">{message}</p>
          <button type="button" className="rec-mini" onClick={() => void start()}>
            다시 시도
          </button>
        </>
      )}

      {state === 'ready' && <span className="rec-hint">모범답안과 번갈아 들으며 억양을 맞춰 보세요</span>}
    </div>
  );
}
