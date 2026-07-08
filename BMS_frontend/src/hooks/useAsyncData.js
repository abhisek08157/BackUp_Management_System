import { useCallback, useEffect, useState } from 'react';

/**
 * Runs an async loader and gives back { data, loading, error, reload }.
 * - Never leaves the UI stuck on "Loading…" forever: any thrown error
 *   (network down, CORS, backend 500, bad JSON shape) is caught and surfaced.
 * - `reload()` lets a page offer a "Try again" button without a full refresh.
 * - Guards against setting state after the component has unmounted.
 *
 * `initialValue` should match the shape the page expects (e.g. [] for lists)
 * so that even mid-error the page can render its empty state instead of
 * blowing up on undefined.
 */
export function useAsyncData(loader, deps = [], initialValue = null) {
  const [data, setData] = useState(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    loader()
      .then((result) => { if (alive) setData(result); })
      .catch((err) => {
        if (!alive) return;
        console.error('Data load failed:', err);
        setError(describeError(err));
      })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadTick]);

  return { data, setData, loading, error, reload };
}

export function describeError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('Network Error') || msg.includes('Failed to fetch')) {
    return 'Could not reach the backend. Confirm the API server is running and that DEMO_MODE / API base URL in src/config.js are set correctly.';
  }
  return msg;
}
