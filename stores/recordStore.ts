import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { storage } from '../lib/mmkv';
import type {
  Feeding,
  FeedingInsert,
  Sleep,
  SleepInsert,
  Diaper,
  DiaperInsert,
  FeedingType,
  AnyRecord,
} from '../types/database';

// ─── 오프라인 지원 ────────────────────────────────────────────────────────────

type PendingRecordType = 'feeding' | 'sleep' | 'diaper';

interface PendingRecord {
  id: string;
  type: PendingRecordType;
  data: FeedingInsert | SleepInsert | DiaperInsert;
  createdAt: string;
}

const PENDING_KEY = 'pending_records';

const generateId = (): string =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const savePendingToStorage = async (records: PendingRecord[]): Promise<void> => {
  const json = JSON.stringify(records);
  try {
    if (storage) {
      storage.set(PENDING_KEY, json);
    } else {
      await AsyncStorage.setItem(PENDING_KEY, json);
    }
  } catch {
    // 스토리지 저장 실패 시 무시
  }
};

const loadPendingFromStorage = async (): Promise<PendingRecord[]> => {
  try {
    let json: string | null = null;
    if (storage) {
      json = storage.getString(PENDING_KEY) ?? null;
    } else {
      json = await AsyncStorage.getItem(PENDING_KEY);
    }
    return json ? (JSON.parse(json) as PendingRecord[]) : [];
  } catch {
    return [];
  }
};

// ─── 타이머 상태 ──────────────────────────────────────────────────────────────

interface ActiveTimer {
  type: 'feeding' | 'sleep';
  startedAt: Date;
  feedingType: FeedingType | null;
}

// ─── Store ───────────────────────────────────────────────────────────────────

interface RecordState {
  feedings: Feeding[];
  sleeps: Sleep[];
  diapers: Diaper[];
  isLoading: boolean;

  activeTimer: ActiveTimer | null;
  pendingSync: PendingRecord[];

  fetchTodayRecords: (babyId: string) => Promise<void>;
  saveFeeding: (data: FeedingInsert) => Promise<void>;
  saveSleep: (data: SleepInsert) => Promise<void>;
  saveDiaper: (data: DiaperInsert) => Promise<void>;
  deleteRecord: (type: PendingRecordType, id: string) => Promise<void>;
  getTimelineForDate: (date: Date) => AnyRecord[];

  startTimer: (type: 'feeding' | 'sleep', feedingType?: FeedingType) => void;
  stopTimer: () => { durationSeconds: number; startedAt: Date } | null;

  syncPending: () => Promise<void>;
  loadPending: () => Promise<void>;
}

const toDateString = (date: Date): string => date.toISOString().split('T')[0];

export const useRecordStore = create<RecordState>((set, get) => ({
  feedings: [],
  sleeps: [],
  diapers: [],
  isLoading: false,
  activeTimer: null,
  pendingSync: [],

  // ─── 오늘 기록 조회 ─────────────────────────────────────────────────────────
  fetchTodayRecords: async (babyId: string) => {
    if (!babyId) return;
    set({ isLoading: true });
    try {
      const today = toDateString(new Date());
      const tomorrow = toDateString(new Date(Date.now() + 86400000));

      const [feedingsRes, sleepsRes, diapersRes] = await Promise.all([
        supabase
          .from('feedings')
          .select('*')
          .eq('baby_id', babyId)
          .gte('started_at', today)
          .lt('started_at', tomorrow)
          .order('started_at', { ascending: false }),
        supabase
          .from('sleeps')
          .select('*')
          .eq('baby_id', babyId)
          .gte('started_at', today)
          .lt('started_at', tomorrow)
          .order('started_at', { ascending: false }),
        supabase
          .from('diapers')
          .select('*')
          .eq('baby_id', babyId)
          .gte('occurred_at', today)
          .lt('occurred_at', tomorrow)
          .order('occurred_at', { ascending: false }),
      ]);

      if (feedingsRes.error) throw feedingsRes.error;
      if (sleepsRes.error) throw sleepsRes.error;
      if (diapersRes.error) throw diapersRes.error;

      set({
        feedings: feedingsRes.data,
        sleeps: sleepsRes.data,
        diapers: diapersRes.data,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // ─── 수유 저장 ─────────────────────────────────────────────────────────────
  saveFeeding: async (data: FeedingInsert) => {
    const idempotentData = { ...data, id: data.id ?? generateId() };
    try {
      const { data: feeding, error } = await supabase
        .from('feedings')
        .upsert(idempotentData)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        feedings: [feeding, ...state.feedings.filter((f) => f.id !== feeding.id)],
      }));
    } catch (err) {
      const pending: PendingRecord = {
        id: idempotentData.id ?? generateId(),
        type: 'feeding',
        data: idempotentData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...get().pendingSync, pending];
      set({ pendingSync: updated });
      await savePendingToStorage(updated);
      throw err;
    }
  },

  // ─── 수면 저장 ─────────────────────────────────────────────────────────────
  saveSleep: async (data: SleepInsert) => {
    const idempotentData = { ...data, id: data.id ?? generateId() };
    try {
      const { data: sleep, error } = await supabase
        .from('sleeps')
        .upsert(idempotentData)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        sleeps: [sleep, ...state.sleeps.filter((s) => s.id !== sleep.id)],
      }));
    } catch (err) {
      const pending: PendingRecord = {
        id: idempotentData.id ?? generateId(),
        type: 'sleep',
        data: idempotentData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...get().pendingSync, pending];
      set({ pendingSync: updated });
      await savePendingToStorage(updated);
      throw err;
    }
  },

  // ─── 기저귀 저장 ───────────────────────────────────────────────────────────
  saveDiaper: async (data: DiaperInsert) => {
    const idempotentData = { ...data, id: data.id ?? generateId() };
    try {
      const { data: diaper, error } = await supabase
        .from('diapers')
        .upsert(idempotentData)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        diapers: [diaper, ...state.diapers.filter((d) => d.id !== diaper.id)],
      }));
    } catch (err) {
      const pending: PendingRecord = {
        id: idempotentData.id ?? generateId(),
        type: 'diaper',
        data: idempotentData,
        createdAt: new Date().toISOString(),
      };
      const updated = [...get().pendingSync, pending];
      set({ pendingSync: updated });
      await savePendingToStorage(updated);
      throw err;
    }
  },

  // ─── 기록 삭제 ─────────────────────────────────────────────────────────────
  deleteRecord: async (type: PendingRecordType, id: string) => {
    const tableMap = {
      feeding: 'feedings',
      sleep: 'sleeps',
      diaper: 'diapers',
    } as const;

    const { error } = await supabase.from(tableMap[type]).delete().eq('id', id);
    if (error) throw error;

    if (type === 'feeding') {
      set((state) => ({ feedings: state.feedings.filter((r) => r.id !== id) }));
    } else if (type === 'sleep') {
      set((state) => ({ sleeps: state.sleeps.filter((r) => r.id !== id) }));
    } else {
      set((state) => ({ diapers: state.diapers.filter((r) => r.id !== id) }));
    }
  },

  // ─── 타임라인 ──────────────────────────────────────────────────────────────
  getTimelineForDate: (date: Date): AnyRecord[] => {
    const { feedings, sleeps, diapers } = get();
    const dateStr = toDateString(date);

    const filtered: AnyRecord[] = [
      ...feedings.filter((f) => f.started_at.startsWith(dateStr)),
      ...sleeps.filter((s) => s.started_at.startsWith(dateStr)),
      ...diapers.filter((d) => d.occurred_at.startsWith(dateStr)),
    ];

    return filtered.sort((a, b) => {
      const aTime = 'started_at' in a ? a.started_at : 'occurred_at' in a ? a.occurred_at : '';
      const bTime = 'started_at' in b ? b.started_at : 'occurred_at' in b ? b.occurred_at : '';
      return new Date(bTime).getTime() - new Date(aTime).getTime();
    });
  },

  // ─── 타이머 ────────────────────────────────────────────────────────────────
  startTimer: (type, feedingType) => {
    set({
      activeTimer: {
        type,
        startedAt: new Date(),
        feedingType: feedingType ?? null,
      },
    });
  },

  stopTimer: () => {
    const { activeTimer } = get();
    if (!activeTimer) return null;

    const durationSeconds = Math.floor(
      (Date.now() - activeTimer.startedAt.getTime()) / 1000,
    );
    const result = { durationSeconds, startedAt: activeTimer.startedAt };
    set({ activeTimer: null });
    return result;
  },

  // ─── 오프라인 싱크 ─────────────────────────────────────────────────────────
  loadPending: async () => {
    const records = await loadPendingFromStorage();
    set({ pendingSync: records });
  },

  syncPending: async () => {
    const { pendingSync } = get();
    if (pendingSync.length === 0) return;

    const succeeded: string[] = [];

    for (const record of pendingSync) {
      try {
        if (record.type === 'feeding') {
          const { error } = await supabase
            .from('feedings')
            .upsert(record.data as FeedingInsert);
          if (!error) succeeded.push(record.id);
        } else if (record.type === 'sleep') {
          const { error } = await supabase
            .from('sleeps')
            .upsert(record.data as SleepInsert);
          if (!error) succeeded.push(record.id);
        } else if (record.type === 'diaper') {
          const { error } = await supabase
            .from('diapers')
            .upsert(record.data as DiaperInsert);
          if (!error) succeeded.push(record.id);
        }
      } catch {
        // 네트워크 오류 시 다음 기회에 재시도
      }
    }

    if (succeeded.length > 0) {
      const remaining = pendingSync.filter((r) => !succeeded.includes(r.id));
      set({ pendingSync: remaining });
      await savePendingToStorage(remaining);
    }
  },
}));
