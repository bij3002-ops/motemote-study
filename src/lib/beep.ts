/* 토스 실전 타이머용 비프음 (Web Audio API) — 파일 없이 그 자리에서 만든다. */

type Ctx = AudioContext & { __unlocked?: boolean };

let ctx: Ctx | null = null;

function getCtx(): Ctx | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor() as Ctx;
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** 사용자가 버튼을 누른 순간 호출해 두면 iOS에서도 이후 비프음이 난다. */
export function unlockAudio(): void {
  const c = getCtx();
  if (!c) return;
  if (!c.__unlocked) {
    c.__unlocked = true;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain).connect(c.destination);
      osc.start();
      osc.stop(c.currentTime + 0.01);
    } catch {
      /* 무시 */
    }
  }
}

function tone(freq: number, durationSec: number, delaySec = 0, volume = 0.16): void {
  const c = getCtx();
  if (!c) return;
  try {
    const start = c.currentTime + delaySec;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationSec);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + durationSec + 0.02);
  } catch {
    /* 무시 */
  }
}

/** 준비 시간 끝 → 답변 시작: 두 번 울린다. */
export function beepAnswerStart(): void {
  tone(660, 0.13, 0);
  tone(990, 0.18, 0.17);
  if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
}

/** 답변 마지막 3초 카운트 */
export function beepTick(): void {
  tone(880, 0.06, 0, 0.09);
}

/** 답변 시간 끝 */
export function beepFinish(): void {
  tone(990, 0.12, 0);
  tone(990, 0.12, 0.15);
  tone(660, 0.24, 0.3);
  if (navigator.vibrate) navigator.vibrate([60, 80, 60, 80, 120]);
}
