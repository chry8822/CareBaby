import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UseRealtimeOptions {
  babyId: string | null;
  onFeedingChange: () => void;
  onSleepChange: () => void;
  onDiaperChange: () => void;
}

/**
 * Supabase Realtime 구독 훅.
 * babyId가 바뀌면 기존 채널을 해제하고 새 채널로 재구독한다.
 * 컴포넌트 언마운트 시 채널 자동 해제.
 */
export function useRealtime({
  babyId,
  onFeedingChange,
  onSleepChange,
  onDiaperChange,
}: UseRealtimeOptions): void {
  // 콜백이 매 렌더마다 새 참조로 들어와도 채널이 재생성되지 않도록 ref에 저장
  const onFeedingRef = useRef(onFeedingChange);
  const onSleepRef = useRef(onSleepChange);
  const onDiaperRef = useRef(onDiaperChange);

  useEffect(() => {
    onFeedingRef.current = onFeedingChange;
  }, [onFeedingChange]);

  useEffect(() => {
    onSleepRef.current = onSleepChange;
  }, [onSleepChange]);

  useEffect(() => {
    onDiaperRef.current = onDiaperChange;
  }, [onDiaperChange]);

  useEffect(() => {
    if (!babyId) return;

    const channel = supabase
      .channel(`baby-${babyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feedings',
          filter: `baby_id=eq.${babyId}`,
        },
        () => onFeedingRef.current(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleeps',
          filter: `baby_id=eq.${babyId}`,
        },
        () => onSleepRef.current(),
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'diapers',
          filter: `baby_id=eq.${babyId}`,
        },
        () => onDiaperRef.current(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [babyId]);
}
