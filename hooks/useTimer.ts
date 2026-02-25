import { useState, useRef, useEffect, useCallback } from 'react';
import { AppState } from 'react-native';

interface UseTimerReturn {
  elapsed: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => number;
  reset: () => void;
}

export const useTimer = (): UseTimerReturn => {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const startTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRunningRef = useRef(false);
  const elapsedRef = useRef(0);

  const clearTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startInterval = () => {
    clearTimer();
    intervalRef.current = setInterval(() => {
      const next = Math.floor((Date.now() - startTimeRef.current) / 1000);
      elapsedRef.current = next;
      setElapsed(next);
    }, 500);
  };

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    elapsedRef.current = 0;
    isRunningRef.current = true;
    setElapsed(0);
    setIsRunning(true);
    setIsPaused(false);
    startInterval();
  }, []);

  const pause = useCallback(() => {
    clearTimer();
    isRunningRef.current = false;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    startTimeRef.current = Date.now() - elapsedRef.current * 1000;
    isRunningRef.current = true;
    setIsPaused(false);
    startInterval();
  }, []);

  const stop = useCallback((): number => {
    clearTimer();
    isRunningRef.current = false;
    const final = elapsedRef.current;
    elapsedRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
    return final;
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    isRunningRef.current = false;
    elapsedRef.current = 0;
    setElapsed(0);
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  // AppState: 포그라운드 복귀 시 경과 시간 재계산
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && isRunningRef.current) {
        const recalculated = Math.floor((Date.now() - startTimeRef.current) / 1000);
        elapsedRef.current = recalculated;
        setElapsed(recalculated);
      }
    });
    return () => subscription.remove();
  }, []);

  // 컴포넌트 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return { elapsed, isRunning, isPaused, start, pause, resume, stop, reset };
};
