import { usePlayer } from '../../hooks/usePlayer';
import { SPEECH_RATES } from '../../lib/tts';
import { speakingPlayer, type PlaySegment } from '../../lib/tts';

type SpeakButtonProps = {
  /** 재생 묶음 식별자 (같은 키를 다시 누르면 멈춤) */
  playKey: string;
  segments: PlaySegment[];
  label: string;
  repeat?: number;
  size?: 'sm' | 'md';
  tone?: 'solid' | 'line' | 'ghost';
};

/** ▶ / ■ 재생 버튼 — MP3가 있으면 파일, 없으면 기기 음성으로 읽는다. */
export function SpeakButton({ playKey, segments, label, repeat = 1, size = 'md', tone = 'ghost' }: SpeakButtonProps) {
  const { key } = usePlayer();
  const active = key === playKey;
  return (
    <button
      type="button"
      className={`spk-btn spk-${tone} spk-${size}${active ? ' on' : ''}`}
      aria-pressed={active}
      aria-label={active ? `${label} 멈춤` : label}
      onClick={() => speakingPlayer.play(playKey, segments, repeat)}
    >
      <span className="spk-icon" aria-hidden="true">
        {active ? '■' : '▶'}
      </span>
      <span>{label}</span>
    </button>
  );
}

/** 재생 속도 0.7x · 0.85x · 1.0x · 1.1x */
export function SpeedChips() {
  const { rate } = usePlayer();
  return (
    <div className="spk-rate" role="group" aria-label="재생 속도">
      {SPEECH_RATES.map((r) => (
        <button
          key={r}
          type="button"
          aria-pressed={Math.abs(rate - r) < 0.001}
          onClick={() => speakingPlayer.setRate(r)}
        >
          {r === 1 ? '1.0x' : `${r}x`}
        </button>
      ))}
    </div>
  );
}

export function StopButton() {
  const { key } = usePlayer();
  return (
    <button type="button" className="spk-stop" onClick={() => speakingPlayer.stop()} disabled={key === null}>
      ■ 멈춤
    </button>
  );
}
