'use client';

import { useEffect, useRef } from 'react';

/**
 * Hook that sets up an interval that only runs when the page is visible.
 * This helps reduce unnecessary API calls when the browser tab is not active.
 *
 * @param callback - Function to call at each interval
 * @param delay - Interval delay in milliseconds, or null to disable
 * @param dependencies - Dependencies array to trigger effect restart
 */
export default function useVisibilityAwareInterval(
  callback: () => void,
  delay: number | null,
  dependencies: any[] = []
) {
  const savedCallback = useRef<() => void>();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }

    function startInterval() {
      if (delay !== null) {
        intervalRef.current = setInterval(tick, delay);
      }
    }

    function stopInterval() {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) {
        stopInterval();
      } else {
        // When page becomes visible again, trigger immediate update then start interval
        tick();
        startInterval();
      }
    }

    // Start interval immediately if page is visible
    if (!document.hidden && delay !== null) {
      startInterval();
    }

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopInterval();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [delay, ...dependencies]);
}