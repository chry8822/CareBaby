import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured, authStorage, authStorageKey } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  /**
   * 앱 최초 세션 확인 완료 여부.
   * 네비게이션 가드는 이 값만 체크한다.
   */
  isInitialized: boolean;
  /**
   * 로그인·로그아웃 API 진행 중 여부 (UI 버튼 비활성화 전용).
   */
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => () => void;
}

/**
 * Supabase storage에서 저장된 user를 직접 읽는다.
 *
 * 배경:
 *   Supabase v2의 getSession() / INITIAL_SESSION은 access token이 만료 근접 시
 *   _callRefreshToken()을 호출한다.
 *   - 비재시도 오류(invalid_grant 등): session을 storage에서 삭제 후 null 반환
 *   - 재시도 가능 오류(네트워크 단절):  session은 storage에 남아있으나 null 반환
 *
 *   이 함수는 INITIAL_SESSION이 null을 반환했을 때 storage를 직접 확인함으로써
 *   두 케이스를 구분한다.
 *   - storage 비어있음 → 로그아웃 (올바른 동작)
 *   - storage에 session 존재 → 로그인 유지 (네트워크 복구 시 auto-refresh가 처리)
 */
const readStoredUser = async (): Promise<User | null> => {
  if (!authStorageKey) return null;
  try {
    const raw = await authStorage.getItem(authStorageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw as string) as { user?: User } | null;
    return parsed?.user ?? null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  isInitialized: false,
  isLoading: false,

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (data.user) {
        set({ user: data.user });
        await get().fetchProfile();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          display_name: displayName,
          avatar_url: null,
          premium_expires_at: null,
        });
        if (profileError) throw profileError;
        await get().fetchProfile();
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      set({ profile: data });
    } catch {
      set({ profile: null });
    }
  },

  initialize: () => {
    if (!isSupabaseConfigured) {
      set({ isInitialized: true });
      return () => {};
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        if (session?.user) {
          // 정상 케이스: session 유효하거나 refresh 성공
          set({ user: session.user, isInitialized: true });
          get().fetchProfile();
        } else {
          // session null = 두 가지 경우:
          // (a) 저장된 세션 없음 → 로그아웃
          // (b) 네트워크 오류로 refresh 실패 → session은 storage에 잔존
          // storage를 직접 읽어 구분한다.
          const storedUser = await readStoredUser();
          set({ user: storedUser, isInitialized: true });
          // 네트워크가 돌아오면 Supabase autoRefreshToken이 갱신하므로
          // fetchProfile 실패는 무시한다.
          if (storedUser) get().fetchProfile().catch(() => {});
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null });
        return;
      }

      // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED 등
      set({ user: session?.user ?? null });
      if (session?.user) {
        get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });

    return () => subscription.unsubscribe();
  },
}));
