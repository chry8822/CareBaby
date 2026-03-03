import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (!isValidUrl(supabaseUrl)) {
  console.warn(
    '[CareBaby] Supabase URL이 설정되지 않았습니다.\n' +
    '.env 파일에 EXPO_PUBLIC_SUPABASE_URL을 입력해주세요.\n' +
    '앱은 실행되지만 인증/DB 기능은 동작하지 않습니다.'
  );
}

// MMKV 자동 분기:
// - Expo Go (개발): AsyncStorage 사용 (MMKV 네이티브 모듈 없음)
// - Development Build / 프로덕션: MMKV 사용 (네이티브 모듈 존재)
const resolveStorage = () => {
  try {
    const { mmkvStorageAdapter } = require('./mmkv');
    if (mmkvStorageAdapter) return mmkvStorageAdapter;
  } catch {
    // MMKV 네이티브 모듈 없음 → AsyncStorage로 fallback
  }
  return AsyncStorage;
};

const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
const PLACEHOLDER_KEY = 'placeholder-key';

// Supabase v2가 실제로 사용하는 storage 인스턴스와 키를 export해
// authStore에서 세션을 직접 읽을 수 있도록 한다.
// (refresh 실패 시 null을 반환하더라도 storage에 세션이 남아있는 경우 로그인 유지)
export const authStorage = resolveStorage();
export const authStorageKey = isValidUrl(supabaseUrl)
  ? `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`
  : '';

export const supabase = createClient<Database>(
  isValidUrl(supabaseUrl) ? supabaseUrl : PLACEHOLDER_URL,
  supabaseAnonKey || PLACEHOLDER_KEY,
  {
    auth: {
      storage: authStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = isValidUrl(supabaseUrl) && !!supabaseAnonKey;
