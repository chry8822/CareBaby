// react-native-mmkv v4.x는 네이티브 모듈 필요 (Development Build 전용)
// Expo Go 환경에서는 try/catch로 비활성화, AsyncStorage로 자동 대체됩니다.

import type { MMKV } from 'react-native-mmkv';

let _storage: MMKV | null = null;

try {
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  _storage = createMMKV({ id: 'carebaby-storage' });
} catch {
  // Expo Go 환경 — MMKV 비활성화, AsyncStorage로 자동 대체됨
}

export const storage = _storage;

export const mmkvStorageAdapter = _storage
  ? {
      getItem: (key: string): string | null =>
        _storage!.getString(key) ?? null,
      setItem: (key: string, value: string): void => {
        _storage!.set(key, value);
      },
      removeItem: (key: string): void => {
        _storage!.remove(key);
      },
    }
  : null;
