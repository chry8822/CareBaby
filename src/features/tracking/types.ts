export type FeedingType =
  | 'breast_left'
  | 'breast_right'
  | 'bottle'
  | 'expressed_milk'
  | 'formula';
export type SleepQuality = 'deep' | 'light' | 'interrupted';
export type DiaperType = 'wet' | 'dirty' | 'mixed' | 'dry';

export interface FeedingRecord {
  id: string;
  timestamp: Date;
  type: FeedingType;
  durationMinutes?: number;
  amountMl?: number;
  note?: string;
  createdAt: Date;
}

export interface SleepRecord {
  id: string;
  startTime: Date;
  endTime: Date | null;
  quality?: SleepQuality;
  note?: string;
  createdAt: Date;
}

export interface DiaperRecord {
  id: string;
  timestamp: Date;
  type: DiaperType;
  color?: string;
  note?: string;
  createdAt: Date;
}

export interface NewFeedingInput {
  type: FeedingType;
  timestamp: Date;
  durationMinutes?: number;
  amountMl?: number;
  note?: string;
}

export interface NewSleepInput {
  startTime: Date;
  endTime: Date | null;
  quality?: SleepQuality;
  note?: string;
}

export interface NewDiaperInput {
  type: DiaperType;
  timestamp: Date;
  color?: string;
  note?: string;
}
