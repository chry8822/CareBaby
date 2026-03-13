import { useState, useEffect, useRef } from 'react';

const MIN_LOADING_MS = 600;

/**
 * isTriggered가 true로 바뀌면 로딩 시작,
 * false로 바뀌어도 MIN_LOADING_MS가 지난 후에야 false를 반환.
 * 데이터가 너무 빨리 도착해서 로딩 UI가 깜빡이는 현상을 방지한다.
 */
export const useMinLoading = (isTriggered: boolean): boolean => {
  const [show, setShow] = useState(isTriggered);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const minMetRef = useRef(false);
  const dataReadyRef = useRef(!isTriggered);

  useEffect(() => {
    if (isTriggered) {
      // 로딩 시작: 기존 타이머 취소 후 새 타이머 시작
      if (timerRef.current) clearTimeout(timerRef.current);
      minMetRef.current = false;
      dataReadyRef.current = false;
      setShow(true);

      timerRef.current = setTimeout(() => {
        minMetRef.current = true;
        // 최소 시간이 지났을 때 데이터도 준비됐으면 숨김
        if (dataReadyRef.current) setShow(false);
      }, MIN_LOADING_MS);
    } else {
      // 데이터 도착: 최소 시간이 이미 지났으면 즉시 숨김
      dataReadyRef.current = true;
      if (minMetRef.current) setShow(false);
      // 아직 최소 시간 전이면 타이머가 만료될 때 자동으로 숨겨짐 (타이머 유지)
    }
    // ※ cleanup에서 타이머를 지우면 isTriggered가 false로 바뀔 때
    //   타이머가 취소되어 로딩이 영원히 남는 버그 발생 → cleanup 제거
  }, [isTriggered]);

  // 언마운트 시에만 타이머 정리
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return show;
};
