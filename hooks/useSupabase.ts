import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseQueryResult<T> {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
  refetch: () => void;
}

export const useSupabaseQuery = <T>(
  queryFn: () => PromiseLike<{ data: T | null; error: PostgrestError | null }>
): UseSupabaseQueryResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trigger, setTrigger] = useState(0);

  const refetch = useCallback(() => setTrigger((prev) => prev + 1), []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      try {
        const result = await queryFn();
        if (!cancelled) {
          setData(result.data);
          setError(result.error);
        }
      } catch {
        if (!cancelled) {
          setError({ message: '알 수 없는 오류가 발생했습니다.' } as PostgrestError);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    run();
    return () => { cancelled = true; };
  }, [trigger]);

  return { data, error, isLoading, refetch };
};

export const useRealtimeSubscription = (
  table: string,
  filter: string | undefined,
  onEvent: () => void
) => {
  useEffect(() => {
    const channelName = filter ? `${table}:${filter}` : table;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        onEvent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onEvent]);
};

export { supabase };
