import { create } from 'zustand';
import type { User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types/database';

interface AuthState {
  user: User | null;
  profile: Profile | null;
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
  isLoading: true,

  signInWithEmail: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // onAuthStateChange에 의존하지 않고 즉시 user를 설정해 리다이렉트 타이밍을 보장
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
      set({ isLoading: false });
      return () => {};
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null, isLoading: false });
      if (session?.user) {
        get().fetchProfile();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
