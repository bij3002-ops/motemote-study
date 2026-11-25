import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  broadcastProgressChange,
  emptyProgress,
  loadProgress,
  loadVocaData,
  normalizeProgress,
  saveProgress,
  VOCA_STORAGE_KEY,
  VOCA_UPDATED_EVENT,
  type VocaData,
  type VocaProgress,
} from '../lib/voca';

/** 단어장 데이터는 탭을 처음 열 때 한 번만 내려받고, 이후에는 모듈 캐시를 쓴다. */
export function useVocaData() {
  const [data, setData] = useState<VocaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setError(null);
    loadVocaData()
      .then((loaded) => {
        if (alive) setData(loaded);
      })
      .catch((err: unknown) => {
        if (alive) setError(err instanceof Error ? err.message : '단어 데이터를 불러오지 못했어요');
      });
    return () => {
      alive = false;
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return { data, error, loading: !data && !error, retry };
}

type Draft = { known: Set<number>; favorites: Set<number>; wrong: Set<number> };

export type VocaProgressStore = {
  progress: VocaProgress;
  known: Set<number>;
  favorites: Set<number>;
  wrong: Set<number>;
  toggleKnown: (id: number) => boolean;
  toggleFavorite: (id: number) => boolean;
  markKnown: (id: number) => void;
  markWrong: (id: number) => void;
  removeWrong: (id: number) => void;
  clearWrong: () => void;
  setLast: (part: number, day: number) => void;
  /** 설정 탭에서 불러온 백업으로 통째로 바꾼다. */
  replace: (value: unknown) => void;
  reset: () => void;
};

export function useVocaProgress(): VocaProgressStore {
  const [progress, setProgress] = useState<VocaProgress>(() => loadProgress());
  const progressRef = useRef(progress);
  progressRef.current = progress;

  const apply = useCallback((next: VocaProgress) => {
    progressRef.current = next;
    setProgress(next);
    saveProgress(next);
  }, []);

  const commit = useCallback(
    (mutate: (draft: Draft) => void) => {
      const current = progressRef.current;
      const draft: Draft = {
        known: new Set(current.known),
        favorites: new Set(current.favorites),
        wrong: new Set(current.wrong),
      };
      mutate(draft);
      apply({
        version: 1,
        known: [...draft.known],
        favorites: [...draft.favorites],
        wrong: [...draft.wrong],
        last: current.last,
        updatedAt: Date.now(),
      });
    },
    [apply],
  );

  // 다른 탭·창이나 설정 탭의 백업 불러오기에서 바뀐 기록을 따라간다.
  useEffect(() => {
    const reload = () => setProgress(loadProgress());
    const onStorage = (event: StorageEvent) => {
      if (event.key === VOCA_STORAGE_KEY) reload();
    };
    window.addEventListener(VOCA_UPDATED_EVENT, reload);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(VOCA_UPDATED_EVENT, reload);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggleKnown = useCallback(
    (id: number) => {
      let added = false;
      commit((draft) => {
        if (draft.known.has(id)) draft.known.delete(id);
        else {
          draft.known.add(id);
          added = true;
        }
      });
      return added;
    },
    [commit],
  );

  const toggleFavorite = useCallback(
    (id: number) => {
      let added = false;
      commit((draft) => {
        if (draft.favorites.has(id)) draft.favorites.delete(id);
        else {
          draft.favorites.add(id);
          added = true;
        }
      });
      return added;
    },
    [commit],
  );

  const markKnown = useCallback(
    (id: number) => {
      if (progressRef.current.known.includes(id)) return;
      commit((draft) => draft.known.add(id));
    },
    [commit],
  );

  const markWrong = useCallback(
    (id: number) => {
      if (progressRef.current.wrong.includes(id)) return;
      commit((draft) => draft.wrong.add(id));
    },
    [commit],
  );

  const removeWrong = useCallback(
    (id: number) => commit((draft) => draft.wrong.delete(id)),
    [commit],
  );

  const clearWrong = useCallback(() => commit((draft) => draft.wrong.clear()), [commit]);

  const setLast = useCallback(
    (part: number, day: number) => {
      const current = progressRef.current;
      if (current.last.part === part && current.last.day === day) return;
      apply({ ...current, last: { part, day } });
    },
    [apply],
  );

  const replace = useCallback(
    (value: unknown) => {
      apply(normalizeProgress(value));
      broadcastProgressChange();
    },
    [apply],
  );

  const reset = useCallback(() => {
    apply({ ...emptyProgress(), updatedAt: Date.now() });
    broadcastProgressChange();
  }, [apply]);

  const known = useMemo(() => new Set(progress.known), [progress.known]);
  const favorites = useMemo(() => new Set(progress.favorites), [progress.favorites]);
  const wrong = useMemo(() => new Set(progress.wrong), [progress.wrong]);

  return {
    progress,
    known,
    favorites,
    wrong,
    toggleKnown,
    toggleFavorite,
    markKnown,
    markWrong,
    removeWrong,
    clearWrong,
    setLast,
    replace,
    reset,
  };
}
