import { useMemo } from 'react';
import { useTrackingStore } from '@/features/tracking/store';
import { getStartOfDay } from '@/shared/utils/date';

interface PatternResult {
  weeklyAverage: {
    feeding: number;
    sleep: number;
    diaper: number;
  };
  todayVsYesterday: {
    feeding: number;
    sleep: number;
    diaper: number;
    yesterdayFeeding: number;
    yesterdaySleep: number;
    yesterdayDiaper: number;
  };
  patterns: string[];
}

export function usePatternAnalysis(): PatternResult {
  const feedings = useTrackingStore((s) => s.feedings) ?? [];
  const sleeps = useTrackingStore((s) => s.sleeps) ?? [];
  const diapers = useTrackingStore((s) => s.diapers) ?? [];

  return useMemo(() => {
    const a = Array.isArray(feedings) ? feedings : [];
    const b = Array.isArray(sleeps) ? sleeps : [];
    const c = Array.isArray(diapers) ? diapers : [];

    const now = new Date();
    const todayStart = getStartOfDay(now);
    const yesterdayStart = new Date(todayStart.getTime() - 86400000);
    const weekAgo = new Date(todayStart.getTime() - 7 * 86400000);

    const weekFeedings = a.filter((f) => f?.timestamp && f.timestamp >= weekAgo);
    const weekSleeps = b.filter((s) => s?.startTime && s.startTime >= weekAgo);
    const weekDiapers = c.filter((d) => d?.timestamp && d.timestamp >= weekAgo);

    const daysWithData = Math.max(
      1,
      Math.min(7, Math.ceil((now.getTime() - weekAgo.getTime()) / 86400000))
    );

    let weekSleepHours = 0;
    for (const s of weekSleeps) {
      if (s.endTime) {
        weekSleepHours +=
          (s.endTime.getTime() - s.startTime.getTime()) / 3600000;
      }
    }

    const weeklyAverage = {
      feeding: weekFeedings.length / daysWithData,
      sleep: weekSleepHours / daysWithData,
      diaper: weekDiapers.length / daysWithData,
    };

    const todayFeedings = a.filter((f) => f?.timestamp && f.timestamp >= todayStart);
    const yesterdayFeedings = a.filter(
      (f) => f?.timestamp && f.timestamp >= yesterdayStart && f.timestamp < todayStart
    );
    const todaySleeps = b.filter((s) => s?.startTime && s.startTime >= todayStart);
    const yesterdaySleeps = b.filter(
      (s) => s?.startTime && s.startTime >= yesterdayStart && s.startTime < todayStart
    );
    const todayDiapers = c.filter((d) => d?.timestamp && d.timestamp >= todayStart);
    const yesterdayDiapers = c.filter(
      (d) => d?.timestamp && d.timestamp >= yesterdayStart && d.timestamp < todayStart
    );

    let todaySleepHours = 0;
    for (const s of todaySleeps) {
      if (s.endTime) {
        todaySleepHours +=
          (s.endTime.getTime() - s.startTime.getTime()) / 3600000;
      }
    }
    let yesterdaySleepHours = 0;
    for (const s of yesterdaySleeps) {
      if (s.endTime) {
        yesterdaySleepHours +=
          (s.endTime.getTime() - s.startTime.getTime()) / 3600000;
      }
    }

    const todayVsYesterday = {
      feeding: todayFeedings.length - yesterdayFeedings.length,
      sleep: Math.round((todaySleepHours - yesterdaySleepHours) * 10) / 10,
      diaper: todayDiapers.length - yesterdayDiapers.length,
      yesterdayFeeding: yesterdayFeedings.length,
      yesterdaySleep: Math.round(yesterdaySleepHours * 10) / 10,
      yesterdayDiaper: yesterdayDiapers.length,
    };

    const patterns: string[] = [];

    if (weekFeedings.length >= 3) {
      const avgFeedingInterval = calculateAverageInterval(
        weekFeedings.map((f) => f.timestamp)
      );
      if (avgFeedingInterval > 0) {
        const hours = Math.floor(avgFeedingInterval / 60);
        const mins = Math.round(avgFeedingInterval % 60);
        patterns.push(
          `평균 수유 간격: ${hours > 0 ? `${hours}시간 ` : ''}${mins}분`
        );
      }
    }

    if (weeklyAverage.feeding > 8) {
      patterns.push('수유 횟수가 평균보다 많아요. 잘 먹고 있어요!');
    } else if (weeklyAverage.feeding < 4 && weekFeedings.length > 0) {
      patterns.push('수유 횟수가 적은 편이에요. 확인해보세요.');
    }

    if (weeklyAverage.sleep > 14) {
      patterns.push('수면 시간이 충분해요!');
    } else if (weeklyAverage.sleep < 10 && weekSleeps.length > 0) {
      patterns.push('수면 시간이 다소 부족할 수 있어요.');
    }

    return { weeklyAverage, todayVsYesterday, patterns };
  }, [feedings, sleeps, diapers]);
}

function calculateAverageInterval(timestamps: Date[]): number {
  if (timestamps.length < 2) return 0;

  const sorted = [...timestamps].sort((a, b) => a.getTime() - b.getTime());
  let totalMinutes = 0;
  for (let i = 1; i < sorted.length; i++) {
    totalMinutes +=
      (sorted[i].getTime() - sorted[i - 1].getTime()) / 60000;
  }
  return totalMinutes / (sorted.length - 1);
}
