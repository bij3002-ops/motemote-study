import { useSyncExternalStore } from 'react';
import { speakingPlayer, type PlayerSnapshot } from '../lib/tts';

/** 재생기 상태(재생 중인 키·문장 위치·속도)를 구독한다. */
export function usePlayer(): PlayerSnapshot {
  return useSyncExternalStore(speakingPlayer.subscribe, speakingPlayer.getSnapshot, speakingPlayer.getSnapshot);
}
