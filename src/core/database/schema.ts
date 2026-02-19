import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const feedings = sqliteTable('feedings', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['breast_left', 'breast_right', 'bottle', 'expressed_milk', 'formula'] }).notNull(),
  durationMinutes: integer('duration_minutes'),
  amountMl: real('amount_ml'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const sleeps = sqliteTable('sleeps', {
  id: text('id').primaryKey(),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  quality: text('quality', { enum: ['deep', 'light', 'interrupted'] }),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const diapers = sqliteTable('diapers', {
  id: text('id').primaryKey(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
  type: text('type', { enum: ['wet', 'dirty', 'mixed', 'dry'] }).notNull(),
  color: text('color'),
  note: text('note'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export type Feeding = typeof feedings.$inferSelect;
export type NewFeeding = typeof feedings.$inferInsert;
export type Sleep = typeof sleeps.$inferSelect;
export type NewSleep = typeof sleeps.$inferInsert;
export type Diaper = typeof diapers.$inferSelect;
export type NewDiaper = typeof diapers.$inferInsert;
