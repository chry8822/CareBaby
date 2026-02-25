import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  /**
   * 앱 최초 세션 확인 완료 여부.
   * 네비게이션 가드는 이 값만 체크한다.
   * 로그인/로그아웃 API 진행 중에는 변하지 않는다.
   */
  isInitialized: boolean;
  /**
   * 로그인·로그아웃 API 진행 중 여부 (UI 버튼 비활성화 전용).
   * 네비게이션 가드에서는 사용하지 않는다.
   */
  isLoading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  initialize: () => () => void;
}

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
      // onAuthStateChange에 의존하지 않고 즉시 user를 설정 → 네비게이션 가드 즉시 트리거
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
      // Supabase 미설정 시 즉시 초기화 완료 처리
      set({ isInitialized: true });
      return () => {};
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      // getSession 완료 = 초기화 완료. isInitialized: true 를 마지막에 설정해
      // 네비게이션 가드가 한 번만 올바른 상태로 판단하도록 보장한다.
      set({ user: session?.user ?? null, isInitialized: true });
      if (session?.user) {
        get().fetchProfile();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // TOKEN_REFRESH_FAILED: 네트워크 오류 등으로 토큰 갱신 실패.
      // 이미 저장된 세션이 있으면 유지하고, 없을 때만 로그아웃 처리.
      if (event === 'TOKEN_REFRESH_FAILED') {
        const currentUser = get().user;
        if (!currentUser) set({ profile: null });
        return;
      }

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
