import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useRealtime } from './useRealtime';
import type { Feeding, Sleep, Diaper, Meal } from '../types/database';

// ─── 공개 타입 ─────────────────────────────────────────────────────────────────

export type TimelineItem =
  | { type: 'feeding'; data: Feeding; time: Date }
  | { type: 'sleep'; data: Sleep; time: Date }
  | { type: 'diaper'; data: Diaper; time: Date }
  | { type: 'meal'; data: Meal; time: Date };

interface TodaySummary {
  feedingCount: number;
  totalSleepSeconds: number;
  diaperCount: number;
  mealCount: number;
}

export interface HomeData {
  lastFeeding: Feeding | null;
  lastSleep: Sleep | null;
  lastDiaper: Diaper | null;
  lastMeal: Meal | null;

  // 경과 시간 (초), 1초마다 업데이트
  feedingElapsed: number;
  sleepElapsed: number;
  diaperElapsed: number;
  mealElapsed: number;

  todaySummary: TodaySummary;

  // Phase 4에서 실제 AI 로직으로 교체
  insight: string | null;

  timeline: TimelineItem[];
  hasMoreTimeline: boolean;
  isLoading: boolean;
  refresh: () => Promise<void>;
  loadMoreTimeline: () => Promise<void>;
}

// ─── 헬퍼 ──────────────────────────────────────────────────────────────────────

function getTodayStart(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}T00:00:00`;
}

// 테이블당 한 번에 가져오는 최대 레코드 수
const FETCH_LIMIT = 50;

// ─── 훅 ────────────────────────────────────────────────────────────────────────

export function useHomeData(babyId: string | null): HomeData {
  const [lastFeeding, setLastFeeding] = useState<Feeding | null>(null);
  const [lastSleep, setLastSleep] = useState<Sleep | null>(null);
  const [lastDiaper, setLastDiaper] = useState<Diaper | null>(null);
  const [lastMeal, setLastMeal] = useState<Meal | null>(null);

  const [feedingElapsed, setFeedingElapsed] = useState(0);
  const [sleepElapsed, setSleepElapsed] = useState(0);
  const [diaperElapsed, setDiaperElapsed] = useState(0);
  const [mealElapsed, setMealElapsed] = useState(0);

  const [todaySummary, setTodaySummary] = useState<TodaySummary>({
    feedingCount: 0,
    totalSleepSeconds: 0,
    diaperCount: 0,
    mealCount: 0,
  });

  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [hasMoreTimeline, setHasMoreTimeline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 각 테이블의 fetch limit (loadMore 시 증가)
  const currentLimit = useRef(FETCH_LIMIT);

  // 경과 타이머용 ref (클로저 문제 방지)
  const feedingTimeRef = useRef<number | null>(null);
  const sleepTimeRef = useRef<number | null>(null);
  const diaperTimeRef = useRef<number | null>(null);
  const mealTimeRef = useRef<number | null>(null);

  const fetch = useCallback(async (limit = currentLimit.current) => {
    if (!babyId) return;

    setIsLoading(true);
    try {
      const todayStart = getTodayStart();

      const [feedRes, sleepRes, diaperRes, mealRes] = await Promise.all([
        supabase
          .from('feedings')
          .select('*')
          .eq('baby_id', babyId)
          .order('started_at', { ascending: false })
          .limit(limit),
        supabase
          .from('sleeps')
          .select('*')
          .eq('baby_id', babyId)
          .order('started_at', { ascending: false })
          .limit(limit),
        supabase
          .from('diapers')
          .select('*')
          .eq('baby_id', babyId)
          .order('occurred_at', { ascending: false })
          .limit(limit),
        supabase
          .from('meals')
          .select('*')
          .eq('baby_id', babyId)
          .order('occurred_at', { ascending: false })
          .limit(limit)
          .then((res) => (res.error ? { data: [] } : res)),
      ]);

      const feedings: Feeding[] = feedRes.data ?? [];
      const sleeps: Sleep[] = sleepRes.data ?? [];
      const diapers: Diaper[] = diaperRes.data ?? [];
      const meals: Meal[] = (mealRes as { data: Meal[] }).data ?? [];

      // 가장 최근 기록 (날짜 무관)
      const latestFeeding = feedings[0] ?? null;
      const latestSleep = sleeps[0] ?? null;
      const latestDiaper = diapers[0] ?? null;
      const latestMeal = meals[0] ?? null;

      setLastFeeding(latestFeeding);
      setLastSleep(latestSleep);
      setLastDiaper(latestDiaper);
      setLastMeal(latestMeal);

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
      mealTimeRef.current = latestMeal
        ? new Date(latestMeal.occurred_at).getTime()
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
      setMealElapsed(
        mealTimeRef.current
          ? Math.floor((Date.now() - mealTimeRef.current) / 1000)
          : 0,
      );

      // 오늘 요약 — 이미 가져온 데이터에서 오늘 것만 필터 (today는 최근 50개 안에 항상 포함됨)
      const todayFeedings = feedings.filter((f) => f.started_at >= todayStart);
      const todaySleeps = sleeps.filter((s) => s.started_at >= todayStart);
      const todayDiapers = diapers.filter((d) => d.occurred_at >= todayStart);
      const todayMeals = meals.filter((m) => m.occurred_at >= todayStart);

      const totalSleepSeconds = todaySleeps.reduce(
        (acc, s) => acc + (s.duration_seconds ?? 0),
        0,
      );
      setTodaySummary({
        feedingCount: todayFeedings.length,
        totalSleepSeconds,
        diaperCount: todayDiapers.length,
        mealCount: todayMeals.length,
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
        ...meals.map(
          (m): TimelineItem => ({
            type: 'meal',
            data: m,
            time: new Date(m.occurred_at),
          }),
        ),
      ].sort((a, b) => b.time.getTime() - a.time.getTime());

      setTimeline(merged);

      // 어느 테이블이든 limit에 딱 맞게 왔으면 더 있을 가능성 있음
      const mightHaveMore =
        feedings.length >= limit ||
        sleeps.length >= limit ||
        diapers.length >= limit ||
        meals.length >= limit;
      setHasMoreTimeline(mightHaveMore);
    } catch {
      // 개별 에러는 각 res에서 이미 처리됨; 전체 실패 시 현재 상태 유지
    } finally {
      setIsLoading(false);
    }
  }, [babyId]);

  const loadMoreTimeline = useCallback(async () => {
    currentLimit.current = currentLimit.current + FETCH_LIMIT;
    await fetch(currentLimit.current);
  }, [fetch]);

  // 최초 + babyId 변경 시 fetch
  useEffect(() => {
    currentLimit.current = FETCH_LIMIT;
    fetch(FETCH_LIMIT);
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
      setMealElapsed(
        mealTimeRef.current
          ? Math.floor((Date.now() - mealTimeRef.current) / 1000)
          : 0,
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Realtime 구독: 다른 기기에서 기록 변경 시 자동 갱신
  useRealtime({
    babyId,
    onFeedingChange: fetch,
    onSleepChange: fetch,
    onDiaperChange: fetch,
  });

  return {
    lastFeeding,
    lastSleep,
    lastDiaper,
    lastMeal,
    feedingElapsed,
    sleepElapsed,
    diaperElapsed,
    mealElapsed,
    todaySummary,
    insight: null,
    timeline,
    hasMoreTimeline,
    isLoading,
    refresh: fetch,
    loadMoreTimeline,
  };
}
