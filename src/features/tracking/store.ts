import { create } from 'zustand';
import { db } from '@/core/database/client';
import { feedings, sleeps, diapers } from '@/core/database/schema';
import { desc } from 'drizzle-orm';
import { getStartOfDay } from '@/shared/utils/date';
import type {
  FeedingRecord,
  SleepRecord,
  DiaperRecord,
  NewFeedingInput,
  NewSleepInput,
  NewDiaperInput,
} from './types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export function getTodayStart(): Date {
  return getStartOfDay(new Date());
}

export function filterTodayFeedings(
  records: FeedingRecord[] | undefined | null
): FeedingRecord[] {
  if (!Array.isArray(records)) return [];
  const todayStart = getTodayStart();
  return records.filter((r) => r?.timestamp && r.timestamp >= todayStart);
}

export function filterTodaySleeps(
  records: SleepRecord[] | undefined | null
): SleepRecord[] {
  if (!Array.isArray(records)) return [];
  const todayStart = getTodayStart();
  return records.filter((s) => s?.startTime && s.startTime >= todayStart);
}

export function filterTodayDiapers(
  records: DiaperRecord[] | undefined | null
): DiaperRecord[] {
  if (!Array.isArray(records)) return [];
  const todayStart = getTodayStart();
  return records.filter((d) => d?.timestamp && d.timestamp >= todayStart);
}

interface TrackingState {
  feedings: FeedingRecord[];
  sleeps: SleepRecord[];
  diapers: DiaperRecord[];
  isLoading: boolean;
  loadAll: () => Promise<void>;
  addFeeding: (input: NewFeedingInput) => void;
  addSleep: (input: NewSleepInput) => void;
  addDiaper: (input: NewDiaperInput) => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  feedings: [],
  sleeps: [],
  diapers: [],
  isLoading: true,

  loadAll: async () => {
    try {
      const [feedingRows, sleepRows, diaperRows] = await Promise.all([
        db.select().from(feedings).orderBy(desc(feedings.timestamp)),
        db.select().from(sleeps).orderBy(desc(sleeps.startTime)),
        db.select().from(diapers).orderBy(desc(diapers.timestamp)),
      ]);

      set({
        feedings: feedingRows.map((r) => ({
          ...r,
          durationMinutes: r.durationMinutes ?? undefined,
          amountMl: r.amountMl ?? undefined,
          note: r.note ?? undefined,
        })),
        sleeps: sleepRows.map((r) => ({
          ...r,
          quality: r.quality ?? undefined,
          note: r.note ?? undefined,
        })),
        diapers: diaperRows.map((r) => ({
          ...r,
          color: r.color ?? undefined,
          note: r.note ?? undefined,
        })),
        isLoading: false,
      });
    } catch (error) {
      console.error('[CareBaby] Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  addFeeding: (input: NewFeedingInput) => {
    const now = new Date();
    const record: FeedingRecord = {
      id: generateId(),
      timestamp: input.timestamp,
      type: input.type,
      durationMinutes: input.durationMinutes,
      amountMl: input.amountMl,
      note: input.note,
      createdAt: now,
    };

    set((state) => ({
      feedings: [record, ...state.feedings],
    }));

    db.insert(feedings)
      .values({
        id: record.id,
        timestamp: record.timestamp,
        type: record.type,
        durationMinutes: record.durationMinutes ?? null,
        amountMl: record.amountMl ?? null,
        note: record.note ?? null,
        createdAt: record.createdAt,
      })
      .catch((err) => console.error('[CareBaby] Insert feeding error:', err));
  },

  addSleep: (input: NewSleepInput) => {
    const now = new Date();
    const record: SleepRecord = {
      id: generateId(),
      startTime: input.startTime,
      endTime: input.endTime,
      quality: input.quality,
      note: input.note,
      createdAt: now,
    };

    set((state) => ({
      sleeps: [record, ...state.sleeps],
    }));

    db.insert(sleeps)
      .values({
        id: record.id,
        startTime: record.startTime,
        endTime: record.endTime ?? null,
        quality: record.quality ?? null,
        note: record.note ?? null,
        createdAt: record.createdAt,
      })
      .catch((err) => console.error('[CareBaby] Insert sleep error:', err));
  },

  addDiaper: (input: NewDiaperInput) => {
    const now = new Date();
    const record: DiaperRecord = {
      id: generateId(),
      timestamp: input.timestamp,
      type: input.type,
      color: input.color,
      note: input.note,
      createdAt: now,
    };

    set((state) => ({
      diapers: [record, ...state.diapers],
    }));

    db.insert(diapers)
      .values({
        id: record.id,
        timestamp: record.timestamp,
        type: record.type,
        color: record.color ?? null,
        note: record.note ?? null,
        createdAt: record.createdAt,
      })
      .catch((err) => console.error('[CareBaby] Insert diaper error:', err));
  },
}));
