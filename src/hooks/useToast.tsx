import { useCallback, useEffect, useRef, useState } from 'react';

export function useToast(): [React.ReactNode, (text: string) => void] {
  const [text, setText] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const show = useCallback((value: string) => {
    setText(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setText(null), 2000);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const node = text ? <div className="toast">{text}</div> : null;
  return [node, show];
}
