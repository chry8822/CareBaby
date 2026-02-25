import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Baby, BabyGender, Caretaker } from '../types/database';

interface BabyState {
  babies: Baby[];
  currentBaby: Baby | null;
  caretakers: Caretaker[];
  isLoading: boolean;
  fetchBabies: () => Promise<void>;
  setCurrentBaby: (baby: Baby) => void;
  createBaby: (name: string, birthDate: string, gender: BabyGender) => Promise<Baby>;
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

      const { currentBaby } = get();
      if (!currentBaby && babies.length > 0) {
        set({ currentBaby: babies[0] });
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
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) throw new Error('로그인이 필요합니다.');

      const { data: baby, error: babyError } = await supabase
        .from('babies')
        .insert({
          name,
          birth_date: birthDate,
          gender,
          avatar_url: null,
          created_by: session.session.user.id,
        })
        .select()
        .single();

      if (babyError) throw babyError;

      const { error: caretakerError } = await supabase.from('caretakers').insert({
        baby_id: baby.id,
        profile_id: session.session.user.id,
        role: 'owner',
        invite_code: null,
        invite_expires_at: null,
      });

      if (caretakerError) throw caretakerError;

      const updatedBabies = [...get().babies, baby];
      set({ babies: updatedBabies, currentBaby: baby });
      return baby;
    } finally {
      set({ isLoading: false });
    }
  },

  generateInviteCode: async (babyId: string) => {
    const { data, error } = await supabase.rpc('generate_invite_code', { baby_id: babyId });
    if (error) throw error;
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
        .select('*')
        .eq('baby_id', babyId);

      if (error) throw error;
      set({ caretakers: data });
    } catch {
      set({ caretakers: [] });
    }
  },
}));
