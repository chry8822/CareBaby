import { useEffect, useRef, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { useTrackingStore } from '@/features/tracking/store';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFICATION_TYPES = {
  FEEDING_REMINDER: 'feeding_reminder',
  SLEEP_REMINDER: 'sleep_reminder',
  DIAPER_REMINDER: 'diaper_reminder',
} as const;

const DEFAULT_INTERVALS = {
  feeding: 180,
  sleep: 240,
  diaper: 180,
} as const;

export function useNotifications() {
  const permissionGranted = useRef(false);

  useEffect(() => {
    const requestPermission = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      permissionGranted.current = status === 'granted';
    };

    requestPermission();
  }, []);

  const scheduleReminder = useCallback(
    async (
      type: keyof typeof NOTIFICATION_TYPES,
      lastRecordTime: Date,
      intervalMinutes: number
    ) => {
      if (!permissionGranted.current) return;

      const triggerTime = new Date(
        lastRecordTime.getTime() + intervalMinutes * 60000
      );
      const secondsFromNow = Math.max(
        1,
        Math.floor((triggerTime.getTime() - Date.now()) / 1000)
      );

      const messages: Record<string, { title: string; body: string }> = {
        FEEDING_REMINDER: {
          title: '수유 알림',
          body: '마지막 수유로부터 시간이 지났어요. 수유할 시간이에요!',
        },
        SLEEP_REMINDER: {
          title: '수면 알림',
          body: '아기의 수면 시간을 확인해주세요.',
        },
        DIAPER_REMINDER: {
          title: '기저귀 알림',
          body: '기저귀를 확인할 시간이에요.',
        },
      };

      const message = messages[type];

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          data: { type },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow,
        },
      });
    },
    []
  );

  const scheduleAllReminders = useCallback(async () => {
    const state = useTrackingStore.getState();
    const lastFeeding =
      state.feedings.length > 0 ? state.feedings[0] : null;
    const lastSleep = state.sleeps.length > 0 ? state.sleeps[0] : null;
    const lastDiaper =
      state.diapers.length > 0 ? state.diapers[0] : null;

    await Notifications.cancelAllScheduledNotificationsAsync();

    if (lastFeeding) {
      await scheduleReminder(
        'FEEDING_REMINDER',
        lastFeeding.timestamp,
        DEFAULT_INTERVALS.feeding
      );
    }
    if (lastSleep) {
      const sleepDate = lastSleep.endTime ?? lastSleep.startTime;
      await scheduleReminder(
        'SLEEP_REMINDER',
        sleepDate,
        DEFAULT_INTERVALS.sleep
      );
    }
    if (lastDiaper) {
      await scheduleReminder(
        'DIAPER_REMINDER',
        lastDiaper.timestamp,
        DEFAULT_INTERVALS.diaper
      );
    }
  }, [scheduleReminder]);

  return { scheduleAllReminders, scheduleReminder };
}
