/* 말하기 재생기 — MP3(원어민 음성) 우선, 없으면 Web Speech API.
 *
 * 한 번에 하나만 재생한다. 화면 여러 곳의 재생 버튼이 같은 재생기를 쓰기 때문에
 * 다른 카드를 누르면 앞의 소리는 자동으로 멈춘다.
 */

export type PlaySegment = {
  text: string;
  /** public 기준 상대 경로 (예: data/speaking-audio/opic-intro-1-q.mp3) */
  audio?: string | null;
};

export type PlayerSnapshot = {
  /** 재생 중인 묶음의 키. null이면 멈춤 */
  key: string | null;
  index: number;
  total: number;
  rate: number;
};

type Listener = () => void;

export const SPEECH_RATES = [0.7, 0.85, 1, 1.1];

function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

/** iOS는 getVoices()가 처음엔 비어 있고 voiceschanged 뒤에 채워진다. */
function pickVoice(): SpeechSynthesisVoice | null {
  if (!canSpeak()) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  return (
    voices.find((v) => /en[-_]US/i.test(v.lang) && /samantha|jenny|aria|natural|google us/i.test(v.name)) ||
    voices.find((v) => /en[-_]US/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    null
  );
}

class SpeakingPlayer {
  private snapshot: PlayerSnapshot = { key: null, index: 0, total: 0, rate: 0.85 };
  private listeners = new Set<Listener>();
  private currentAudio: HTMLAudioElement | null = null;
  private token = 0;

  getSnapshot = (): PlayerSnapshot => this.snapshot;

  subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private emit(patch: Partial<PlayerSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...patch };
    this.listeners.forEach((fn) => fn());
  }

  setRate(rate: number): void {
    this.emit({ rate });
  }

  isPlaying(key: string): boolean {
    return this.snapshot.key === key;
  }

  /** 재생 중지 — 오디오와 Web Speech 둘 다 끊는다. */
  stop = (): void => {
    this.token += 1;
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio.removeAttribute('src');
        this.currentAudio.load();
      } catch {
        /* 무시 */
      }
      this.currentAudio = null;
    }
    if (canSpeak()) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* 무시 */
      }
    }
    if (this.snapshot.key !== null) this.emit({ key: null, index: 0, total: 0 });
  };

  play = (key: string, segments: PlaySegment[], repeat = 1): void => {
    const usable = segments.filter((s) => (s.text && s.text.trim()) || s.audio);
    if (!usable.length) return;
    // 같은 키를 다시 누르면 멈춘다(토글).
    if (this.snapshot.key === key) {
      this.stop();
      return;
    }
    this.stop();
    const token = (this.token += 1);
    this.emit({ key, index: 0, total: usable.length });
    void this.run(token, key, usable, Math.max(1, Math.min(3, repeat)), 0);
  };

  private async run(token: number, key: string, segments: PlaySegment[], repeat: number, round: number): Promise<void> {
    const rate = this.snapshot.rate;
    for (let r = 0; r < repeat; r += 1) {
      for (let i = 0; i < segments.length; i += 1) {
        if (token !== this.token) return;
        this.emit({ index: i, total: segments.length });
        await this.speakOne(segments[i], rate, token);
        if (token !== this.token) return;
        await wait(90);
      }
      if (round + r < repeat - 1) await wait(320);
    }
    if (token === this.token) this.emit({ key: null, index: 0, total: 0 });
    void key;
  }

  private async speakOne(segment: PlaySegment, rate: number, token: number): Promise<void> {
    const url = segment.audio ? new URL(segment.audio, document.baseURI).toString() : null;
    if (url) {
      const played = await this.playFile(url, rate, token);
      if (played) return;
    }
    // 오디오 파일이 없거나 재생에 실패하면 기기 음성으로 읽는다.
    await this.speakWithWebSpeech(segment.text, rate, token);
  }

  private playFile(url: string, rate: number, token: number): Promise<boolean> {
    return new Promise((resolve) => {
      const audio = new Audio(url);
      this.currentAudio = audio;
      try {
        audio.playbackRate = rate;
        // 피치 유지(지원하는 브라우저만)
        (audio as HTMLAudioElement & { preservesPitch?: boolean }).preservesPitch = true;
      } catch {
        /* 무시 */
      }
      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (this.currentAudio === audio) this.currentAudio = null;
        resolve(ok);
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.onabort = () => finish(token !== this.token);
      // 4초 안에 시작하지 못하면(파일 없음·차단) 기기 음성으로 넘어간다.
      const guard = window.setTimeout(() => {
        if (!settled && (audio.paused || audio.currentTime === 0)) {
          try {
            audio.pause();
          } catch {
            /* 무시 */
          }
          finish(false);
        }
      }, 4000);
      audio.onplaying = () => window.clearTimeout(guard);
      void audio.play().catch(() => {
        window.clearTimeout(guard);
        finish(false);
      });
    });
  }

  private speakWithWebSpeech(text: string, rate: number, token: number): Promise<void> {
    if (!canSpeak() || !text.trim()) return Promise.resolve();
    return new Promise((resolve) => {
      try {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1;
        const voice = pickVoice();
        if (voice) utterance.voice = voice;
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          resolve();
        };
        utterance.onend = finish;
        utterance.onerror = finish;
        // iOS에서 cancel 뒤 speak가 무시되는 경우가 있어 짧게 끊고 다시 넣는다.
        synth.speak(utterance);
        window.setTimeout(() => {
          if (token !== this.token) finish();
        }, 50);
      } catch {
        resolve();
      }
    });
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export const speakingPlayer = new SpeakingPlayer();
