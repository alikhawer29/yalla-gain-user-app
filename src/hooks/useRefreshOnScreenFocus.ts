import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

type RefetchFn = (() => unknown) | undefined | null;

/**
 * Soft-refetch whenever the screen gains focus.
 * Skips the first focus (initial mount already loads via the query hook).
 */
export function useRefreshOnScreenFocus(...refetchers: RefetchFn[]): void {
  const refetchersRef = useRef(refetchers);
  refetchersRef.current = refetchers;
  const skipFirst = useRef(true);

  useFocusEffect(
    useCallback(() => {
      if (skipFirst.current) {
        skipFirst.current = false;
        return;
      }
      for (const refetch of refetchersRef.current) {
        try {
          refetch?.();
        } catch {
          // ignore
        }
      }
    }, []),
  );
}
