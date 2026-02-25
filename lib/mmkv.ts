// react-native-mmkv v4.x는 네이티브 모듈 필요 (Development Build 전용)
// Expo Go 환경에서는 try/catch로 비활성화, AsyncStorage로 자동 대체됩니다.
//
// 주의: Expo Go에서 createMMKV()가 에러 없이 호출되지만 실제 네이티브
// 모듈이 없으면 read/write가 동작하지 않을 수 있습니다.
// 반드시 자가 테스트(write → read)로 실제 동작 여부를 검증합니다.

import type { MMKV } from 'react-native-mmkv';

let _storage: MMKV | null = null;
let _isWorking = false;

try {
  const { createMMKV } = require('react-native-mmkv') as typeof import('react-native-mmkv');
  _storage = createMMKV({ id: 'carebaby-storage' });

  // 실제 read/write 동작 검증 (네이티브 모듈 없으면 여기서 실패)
  const TEST_KEY = '__mmkv_init_test__';
  _storage.set(TEST_KEY, 'ok');
  _isWorking = _storage.getString(TEST_KEY) === 'ok';
  _storage.delete(TEST_KEY);
} catch {
  // Expo Go 환경 또는 네이티브 모듈 없음 — AsyncStorage로 자동 대체됨
  _storage = null;
  _isWorking = false;
}

export const storage = _isWorking ? _storage : null;

export const mmkvStorageAdapter = (_storage && _isWorking)
  ? {
      getItem: (key: string): string | null =>
        _storage!.getString(key) ?? null,
      setItem: (key: string, value: string): void => {
        _storage!.set(key, value);
      },
      removeItem: (key: string): void => {
        _storage!.delete(key);
      },
    }
  : null;
