import { useEffect, useRef } from 'react';

type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: string, listener: () => void) => void;
};

type WakeLockNavigator = Navigator & {
  wakeLock?: {
    request: (type: 'screen') => Promise<WakeLockSentinelLike>;
  };
};

export function wakeLockSupported(): boolean {
  return typeof navigator !== 'undefined' && !!(navigator as WakeLockNavigator).wakeLock;
}

/**
 * 타이머가 도는 동안 화면이 꺼지지 않게 한다. (Screen Wake Lock API)
 * 지원하지 않는 브라우저(iOS 16.3 이하 등)에서는 조용히 아무것도 하지 않는다.
 */
export function useWakeLock(active: boolean): void {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  useEffect(() => {
    const nav = navigator as WakeLockNavigator;
    let cancelled = false;

    async function acquire() {
      if (!active || !nav.wakeLock || sentinelRef.current) return;
      try {
        const sentinel = await nav.wakeLock.request('screen');
        if (cancelled) {
          await sentinel.release().catch(() => undefined);
          return;
        }
        sentinelRef.current = sentinel;
        sentinel.addEventListener('release', () => {
          if (sentinelRef.current === sentinel) sentinelRef.current = null;
        });
      } catch {
        /* 사용자가 거부했거나 배터리 절약 모드 */
      }
    }

    function onVisible() {
      if (document.visibilityState === 'visible' && active) void acquire();
    }

    void acquire();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', onVisible);
      const sentinel = sentinelRef.current;
      sentinelRef.current = null;
      if (sentinel) void sentinel.release().catch(() => undefined);
    };
  }, [active]);
}
