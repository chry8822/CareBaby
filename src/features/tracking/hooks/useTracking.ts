import { useEffect, useMemo } from 'react';
import { useTrackingStore } from '../store';
import { getStartOfDay } from '@/shared/utils/date';

export function useTracking() {
  const loadAll = useTrackingStore((s) => s.loadAll);
  const isLoading = useTrackingStore((s) => s.isLoading);
  const feedings = useTrackingStore((s) => s.feedings);
  const sleeps = useTrackingStore((s) => s.sleeps);
  const diapers = useTrackingStore((s) => s.diapers);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const todayStart = useMemo(() => getStartOfDay(new Date()), []);

  const todayFeedings = useMemo(
    () => feedings.filter((f) => f.timestamp >= todayStart),
    [feedings, todayStart]
  );

  const todaySleeps = useMemo(
    () => sleeps.filter((s) => s.startTime >= todayStart),
    [sleeps, todayStart]
  );

  const todayDiapers = useMemo(
    () => diapers.filter((d) => d.timestamp >= todayStart),
    [diapers, todayStart]
  );

  const lastFeeding = feedings.length > 0 ? feedings[0] : null;
  const lastSleep = sleeps.length > 0 ? sleeps[0] : null;
  const lastDiaper = diapers.length > 0 ? diapers[0] : null;

  return {
    isLoading,
    feedings,
    sleeps,
    diapers,
    todayFeedings,
    todaySleeps,
    todayDiapers,
    lastFeeding,
    lastSleep,
    lastDiaper,
  };
}
