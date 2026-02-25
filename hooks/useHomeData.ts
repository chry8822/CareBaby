import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import type { Feeding, Sleep, Diaper } from '../types/database';

// ─── 공개 타입 ─────────────────────────────────────────────────────────────────

export type TimelineItem =
  | { type: 'feeding'; data: Feeding; time: Date }
  | { type: 'sleep'; data: Sleep; time: Date }
  | { type: 'diaper'; data: Diaper; time: Date };

interface TodaySummary {
  feedingCount: number;
  totalSleepSeconds: number;
  diaperCount: number;
}

export interface HomeData {
  lastFeeding: Feeding | null;
  lastSleep: Sleep | null;
  lastDiaper: Diaper | null;

  // 경과 시간 (초), 1초마다 업데이트
  feedingElapsed: number;
  sleepElapsed: number;
  diaperElapsed: number;

  todaySummary: TodaySummary;

  // Phase 4에서 실제 AI 로직으로 교체
  insight: string | null;

  timeline: TimelineItem[];
  isLoading: boolean;
  refresh: () => Promise<void>;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

function calcElapsed(isoString: string | null): number {
  if (!isoString) return 0;
  return Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
}

function getTodayStart(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T00:00:00`;
}

// ─── 훅 ────────────────────────────────────────────────────────────────────────

export function useHomeData(babyId: string | null): HomeData {
  const [lastFeeding, setLastFeeding] = useState<Feeding | null>(null);
  const [lastSleep, setLastSleep] = useState<Sleep | null>(null);
  const [lastDiaper, setLastDiaper] = useState<Diaper | null>(null);

  const [feedingElapsed, setFeedingElapsed] = useState(0);
  const [sleepElapsed, setSleepElapsed] = useState(0);
  const [diaperElapsed, setDiaperElapsed] = useState(0);

  const [todaySummary, setTodaySummary] = useState<TodaySummary>({
    feedingCount: 0,
    totalSleepSeconds: 0,
    diaperCount: 0,
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 경과 타이머용 ref (클로저 문제 방지)
  const feedingTimeRef = useRef<number | null>(null);
  const sleepTimeRef = useRef<number | null>(null);
  const diaperTimeRef = useRef<number | null>(null);

  const fetch = useCallback(async () => {
    if (!babyId) return;

    setIsLoading(true);
    try {
      const todayStart = getTodayStart();

      const [feedRes, sleepRes, diaperRes] = await Promise.all([
        supabase
          .from('feedings')
          .select('*')
          .eq('baby_id', babyId)
          .gte('started_at', todayStart)
          .order('started_at', { ascending: false }),
        supabase
          .from('sleeps')
          .select('*')
          .eq('baby_id', babyId)
          .gte('started_at', todayStart)
          .order('started_at', { ascending: false }),
        supabase
          .from('diapers')
          .select('*')
          .eq('baby_id', babyId)
          .gte('occurred_at', todayStart)
          .order('occurred_at', { ascending: false }),
      ]);

      const feedings: Feeding[] = feedRes.data ?? [];
      const sleeps: Sleep[] = sleepRes.data ?? [];
      const diapers: Diaper[] = diaperRes.data ?? [];

      // 마지막 기록
      const latestFeeding = feedings[0] ?? null;
      const latestSleep = sleeps[0] ?? null;
      const latestDiaper = diapers[0] ?? null;

      setLastFeeding(latestFeeding);
      setLastSleep(latestSleep);
      setLastDiaper(latestDiaper);

      // elapsed ref 업데이트
      feedingTimeRef.current = latestFeeding
        ? new Date(latestFeeding.started_at).getTime()
        : null;
      sleepTimeRef.current = latestSleep
        ? new Date(latestSleep.ended_at ?? latestSleep.started_at).getTime()
        : null;
      diaperTimeRef.current = latestDiaper
        ? new Date(latestDiaper.occurred_at).getTime()
        : null;

      // 초기 elapsed 설정
      setFeedingElapsed(
        feedingTimeRef.current
          ? Math.floor((Date.now() - feedingTimeRef.current) / 1000)
          : 0,
      );
      setSleepElapsed(
        sleepTimeRef.current
          ? Math.floor((Date.now() - sleepTimeRef.current) / 1000)
          : 0,
      );
      setDiaperElapsed(
        diaperTimeRef.current
          ? Math.floor((Date.now() - diaperTimeRef.current) / 1000)
          : 0,
      );

      // 오늘 요약
      const totalSleepSeconds = sleeps.reduce(
        (acc, s) => acc + (s.duration_seconds ?? 0),
        0,
      );
      setTodaySummary({
        feedingCount: feedings.length,
        totalSleepSeconds,
        diaperCount: diapers.length,
      });

      // 타임라인 합치기 (최신순 정렬)
      const merged: TimelineItem[] = [
        ...feedings.map(
          (f): TimelineItem => ({
            type: 'feeding',
            data: f,
            time: new Date(f.started_at),
          }),
        ),
        ...sleeps.map(
          (s): TimelineItem => ({
            type: 'sleep',
            data: s,
            time: new Date(s.started_at),
          }),
        ),
        ...diapers.map(
          (d): TimelineItem => ({
            type: 'diaper',
            data: d,
            time: new Date(d.occurred_at),
          }),
        ),
      ].sort((a, b) => b.time.getTime() - a.time.getTime());

      setTimeline(merged);
    } catch {
      // 개별 에러는 각 res에서 이미 처리됨; 전체 실패 시 현재 상태 유지
    } finally {
      setIsLoading(false);
    }
  }, [babyId]);

  // 최초 + babyId 변경 시 fetch
  useEffect(() => {
    fetch();
  }, [fetch]);

  // 1초마다 elapsed 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setFeedingElapsed(
        feedingTimeRef.current
          ? Math.floor((Date.now() - feedingTimeRef.current) / 1000)
          : 0,
      );
      setSleepElapsed(
        sleepTimeRef.current
          ? Math.floor((Date.now() - sleepTimeRef.current) / 1000)
          : 0,
      );
      setDiaperElapsed(
        diaperTimeRef.current
          ? Math.floor((Date.now() - diaperTimeRef.current) / 1000)
          : 0,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Phase 3에서 Realtime 구독으로 교체 예정
  /*
  useEffect(() => {
    if (!babyId) return;
    const channel = supabase
      .channel('home-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedings', filter: `baby_id=eq.${babyId}` }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sleeps', filter: `baby_id=eq.${babyId}` }, fetch)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'diapers', filter: `baby_id=eq.${babyId}` }, fetch)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [babyId, fetch]);
  */

  return {
    lastFeeding,
    lastSleep,
    lastDiaper,
    feedingElapsed,
    sleepElapsed,
    diaperElapsed,
    todaySummary,
    insight: null, // Phase 4에서 실제 AI 인사이트로 교체
    timeline,
    isLoading,
    refresh: fetch,
  };
}
