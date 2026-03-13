import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Baby, BabyGender, CaretakerWithProfile } from '../types/database';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  caretakers: CaretakerWithProfile[];
  isLoading: boolean;
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby) => void;
  createBaby: (name: string, birthDate: string, gender: BabyGender) => Promise<Baby>;
  updateBaby: (babyId: string, name: string, birthDate: string, gender: BabyGender, avatarUrl?: string | null) => Promise<Baby>;
  generateInviteCode: (babyId: string) => Promise<string>;
  joinByInviteCode: (code: string) => Promise<{ success: boolean; baby_id: string | null }>;
  fetchCaretakers: (babyId: string) => Promise<void>;
}

export const useBabyStore = create<BabyState>((set, get) => ({
  babies: [],
  currentBaby: null,
  caretakers: [],
  isLoading: false,

  fetchBabies: async () => {
    set({ isLoading: true });
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('caretakers')
        .select('baby_id, babies(*)')
        .eq('profile_id', session.session.user.id);

      if (error) throw error;

      const babies = data
        .map((ct) => ct.babies as unknown as Baby)
        .filter(Boolean);

      set({ babies });

      // currentBaby를 항상 최신 데이터로 동기화
      const { currentBaby } = get();
      if (!currentBaby && babies.length > 0) {
        set({ currentBaby: babies[0] });
      } else if (currentBaby) {
        const refreshed = babies.find((b) => b.id === currentBaby.id);
        if (refreshed) set({ currentBaby: refreshed });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  setCurrentBaby: (baby: Baby) => {
    set({ currentBaby: baby });
    get().fetchCaretakers(baby.id);
  },

  createBaby: async (name: string, birthDate: string, gender: BabyGender) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.rpc('create_baby_with_owner', {
        p_name: name,
        p_birth_date: birthDate,
        p_gender: gender,
        p_avatar_url: null,
      });

      if (error) throw error;

      const baby = data as Baby;
      const updatedBabies = [...get().babies, baby];
      set({ babies: updatedBabies, currentBaby: baby });
      return baby;
    } finally {
      set({ isLoading: false });
    }
  },

  updateBaby: async (babyId: string, name: string, birthDate: string, gender: BabyGender, avatarUrl?: string | null) => {
    set({ isLoading: true });
    try {
      // 기본 필드 업데이트
      const { error: baseError } = await supabase
        .from('babies')
        .update({ name, birth_date: birthDate, gender })
        .eq('id', babyId);

      if (baseError) throw baseError;

      // avatar_url은 RLS 우회를 위해 SECURITY DEFINER RPC로 업데이트
      if (avatarUrl !== undefined) {
        const { error: avatarError } = await supabase
          .rpc('update_baby_avatar', { p_baby_id: babyId, p_avatar_url: avatarUrl });
        if (avatarError) throw avatarError;
      }

      const error = null;

      // SELECT RLS 무관하게 스토어를 직접 패치
      const existing = get().babies.find((b) => b.id === babyId);
      const patched: Baby = {
        ...(existing ?? ({ id: babyId } as Baby)),
        name,
        birth_date: birthDate,
        gender,
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      };

      const updatedBabies = get().babies.map((b) => (b.id === babyId ? patched : b));
      const currentBaby = get().currentBaby;
      set({
        babies: updatedBabies,
        currentBaby: currentBaby?.id === babyId ? patched : currentBaby,
      });
      return patched;
    } finally {
      set({ isLoading: false });
    }
  },

  generateInviteCode: async (babyId: string) => {
    const { data, error } = await supabase.rpc('generate_invite_code', { p_baby_id: babyId });
    if (error) throw error;
    // 생성 후 caretakers 즉시 갱신 (InviteCodeCard 코드 반영)
    await get().fetchCaretakers(babyId);
    return data as string;
  },

  joinByInviteCode: async (code: string) => {
    const { data, error } = await supabase.rpc('join_by_invite_code', { code });
    if (error) throw error;
    await get().fetchBabies();
    return data as { success: boolean; baby_id: string | null };
  },

  fetchCaretakers: async (babyId: string) => {
    try {
      const { data, error } = await supabase
        .from('caretakers')
        .select('*, profiles(display_name, avatar_url, parent_role)')
        .eq('baby_id', babyId);

      if (error) throw error;
      set({ caretakers: data as CaretakerWithProfile[] });
    } catch {
      set({ caretakers: [] });
    }
  },
}));
