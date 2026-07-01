// Performance optimization hooks
import React, { useCallback, useMemo, DependencyList } from 'react';

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList
): T {
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay, ...deps]
  ) as T;
}

export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  interval: number,
  deps: DependencyList
): T {
  const lastRunRef = React.useRef<number>(0);

  return useCallback(
    (...args: any[]) => {
      const now = Date.now();
      if (now - lastRunRef.current >= interval) {
        lastRunRef.current = now;
        callback(...args);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [interval, ...deps]
  ) as T;
}
