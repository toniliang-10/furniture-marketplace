import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchFurniture } from '../api/client.js';

/**
 * Manages the swipe deck: loads AVAILABLE items for the active category,
 * tracks which card is on top, and exposes advance/reset/retry helpers.
 *
 * The deck renders the LAST item in `remaining` as the top card, so advancing
 * simply pops from the end (cheap, and keeps DOM order stable for the stack).
 */
export function useFurnitureDeck() {
  const [category, setCategory] = useState(null); // null = all categories
  const [remaining, setRemaining] = useState([]);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);

  // Guards against a stale request resolving after a newer one (race condition).
  const requestIdRef = useRef(0);

  const load = useCallback((activeCategory) => {
    const requestId = ++requestIdRef.current;
    const controller = new AbortController();

    setStatus('loading');
    setError(null);

    fetchFurniture({
      category: activeCategory ?? undefined,
      status: 'AVAILABLE',
      signal: controller.signal,
    })
      .then(({ items }) => {
        if (requestId !== requestIdRef.current) return; // superseded
        // Reverse so the first item from the API ends up on top of the stack.
        setRemaining([...items].reverse());
        setStatus('ready');
      })
      .catch((err) => {
        if (controller.signal.aborted || requestId !== requestIdRef.current) return;
        setError(err);
        setStatus('error');
      });

    return controller;
  }, []);

  useEffect(() => {
    const controller = load(category);
    return () => controller.abort();
  }, [category, load]);

  // Remove the top card (by id) — used after a swipe/skip/interest action.
  const advance = useCallback((id) => {
    setRemaining((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const reset = useCallback(() => {
    load(category);
  }, [category, load]);

  const changeCategory = useCallback((next) => {
    setCategory(next);
  }, []);

  const topCard = remaining.length > 0 ? remaining[remaining.length - 1] : null;
  // The card directly beneath the top one, used to render the stacked peek.
  const nextCard = remaining.length > 1 ? remaining[remaining.length - 2] : null;

  return {
    category,
    changeCategory,
    remaining,
    topCard,
    nextCard,
    status,
    error,
    advance,
    reset,
    isEmpty: status === 'ready' && remaining.length === 0,
  };
}
