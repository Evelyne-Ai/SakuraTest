import { useCallback, useEffect, useState } from 'react';

interface State<T> { data: T | null; error: Error | null; loading: boolean }

export function useFetch<T>(fn: (signal: AbortSignal) => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fn(ctrl.signal)
      .then((data) => !ctrl.signal.aborted && setState({ data, error: null, loading: false }))
      .catch((error: Error) => !ctrl.signal.aborted && setState({ data: null, error, loading: false }));
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  const retry = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, retry };
}
