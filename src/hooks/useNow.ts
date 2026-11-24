import { useEffect, useState } from 'react';

/** 주기적으로 현재 시각을 갱신한다. running=false 이면 멈춘다. */
export function useNow(intervalMs = 250, running = true): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!running) {
      setNow(Date.now());
      return;
    }
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, running]);

  return now;
}
