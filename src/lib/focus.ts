import type { AppData } from '../types';

/**
 * 지금 화면을 흑백으로 둬야 하는 순간인가?
 * - 설정의 '타이머 실행 시 흑백 집중 모드'가 켜져 있고
 * - 타이머가 실제로 돌고 있고 (일시정지·저장·초기화면 startedAt이 null)
 * - 뽀모도로라면 집중 구간일 때만 (휴식 구간은 컬러로 풀어 준다)
 */
export function isFocusGrayOn(data: AppData): boolean {
  if (data.settings.focusGrayscale === false) return false;
  const timer = data.timer;
  if (!timer || timer.startedAt === null) return false;
  if (timer.mode === 'pomodoro' && timer.phase === 'break') return false;
  return true;
}

/** <html data-focus-gray> 를 켜고 끈다. CSS가 이 값으로 filter: grayscale()을 건다. */
export function applyFocusGray(on: boolean): void {
  document.documentElement.dataset.focusGray = on ? 'on' : 'off';
}
