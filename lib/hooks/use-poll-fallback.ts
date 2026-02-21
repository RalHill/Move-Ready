import { useEffect, useRef } from "react";

interface UsePollFallbackOptions {
  enabled: boolean;
  intervalMs?: number;
  onPoll: () => void | Promise<void>;
}

export function usePollFallback({
  enabled,
  intervalMs = 15000,
  onPoll,
}: UsePollFallbackOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(async () => {
      await onPoll();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, intervalMs, onPoll]);
}
