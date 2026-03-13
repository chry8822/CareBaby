import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type {
  Temperature,
  TemperatureInsert,
  TemperatureUpdate,
  Medicine,
  MedicineInsert,
  MedicineUpdate,
  HospitalVisit,
  HospitalVisitInsert,
  HospitalVisitUpdate,
} from '../types/database';

interface HealthState {
  temperatures: Temperature[];
  medicines: Medicine[];
  hospitalVisits: HospitalVisit[];
  isLoading: boolean;
  /** 현재 스토어에 로드된 데이터의 babyId (아기 전환 감지용) */
  loadedBabyId: string | null;

  fetchHealthRecords: (babyId: string) => Promise<void>;
  saveTemperature: (data: TemperatureInsert) => Promise<void>;
  updateTemperature: (id: string, data: TemperatureUpdate) => Promise<void>;
  saveMedicine: (data: MedicineInsert) => Promise<void>;
  updateMedicine: (id: string, data: MedicineUpdate) => Promise<void>;
  saveHospitalVisit: (data: HospitalVisitInsert) => Promise<void>;
  updateHospitalVisit: (id: string, data: HospitalVisitUpdate) => Promise<void>;
  deleteTemperature: (id: string) => Promise<void>;
  deleteMedicine: (id: string) => Promise<void>;
  deleteHospitalVisit: (id: string) => Promise<void>;
}

export const useHealthStore = create<HealthState>((set, get) => ({
  temperatures: [],
  medicines: [],
  hospitalVisits: [],
  isLoading: false,
  loadedBabyId: null,

  fetchHealthRecords: async (babyId: string) => {
    if (!babyId) return;
    set({ isLoading: true });
    try {
      const [tempRes, medRes, hospRes] = await Promise.all([
        supabase
          .from('temperatures')
          .select('*')
          .eq('baby_id', babyId)
          .order('measured_at', { ascending: false })
          .limit(50),
        supabase
          .from('medicines')
          .select('*')
          .eq('baby_id', babyId)
          .order('given_at', { ascending: false })
          .limit(50),
        supabase
          .from('hospital_visits')
          .select('*')
          .eq('baby_id', babyId)
          .order('occurred_at', { ascending: false })
          .limit(50),
      ]);

      // PGRST205: 테이블 미생성 시 무시 (Supabase SQL 실행 전 상태)
      const isTableMissing = (code?: string) => code === 'PGRST205';

      if (tempRes.error && !isTableMissing(tempRes.error.code)) throw tempRes.error;
      if (medRes.error && !isTableMissing(medRes.error.code)) throw medRes.error;
      if (hospRes.error && !isTableMissing(hospRes.error.code)) throw hospRes.error;

      set({
        temperatures: tempRes.data ?? [],
        medicines: medRes.data ?? [],
        hospitalVisits: hospRes.data ?? [],
        loadedBabyId: babyId,
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveTemperature: async (data: TemperatureInsert) => {
    const { data: row, error } = await supabase
      .from('temperatures')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ temperatures: [row, ...state.temperatures] }));
  },

  updateTemperature: async (id: string, data: TemperatureUpdate) => {
    const { data: row, error } = await supabase
      .from('temperatures')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ temperatures: state.temperatures.map((r) => (r.id === id ? row : r)) }));
  },

  saveMedicine: async (data: MedicineInsert) => {
    const { data: row, error } = await supabase
      .from('medicines')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ medicines: [row, ...state.medicines] }));
  },

  updateMedicine: async (id: string, data: MedicineUpdate) => {
    const { data: row, error } = await supabase
      .from('medicines')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ medicines: state.medicines.map((r) => (r.id === id ? row : r)) }));
  },

  saveHospitalVisit: async (data: HospitalVisitInsert) => {
    const { data: row, error } = await supabase
      .from('hospital_visits')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ hospitalVisits: [row, ...state.hospitalVisits] }));
  },

  updateHospitalVisit: async (id: string, data: HospitalVisitUpdate) => {
    const { data: row, error } = await supabase
      .from('hospital_visits')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    set((state) => ({ hospitalVisits: state.hospitalVisits.map((r) => (r.id === id ? row : r)) }));
  },

  deleteTemperature: async (id: string) => {
    const { error } = await supabase.from('temperatures').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ temperatures: state.temperatures.filter((r) => r.id !== id) }));
  },

  deleteMedicine: async (id: string) => {
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ medicines: state.medicines.filter((r) => r.id !== id) }));
  },

  deleteHospitalVisit: async (id: string) => {
    const { error } = await supabase.from('hospital_visits').delete().eq('id', id);
    if (error) throw error;
    set((state) => ({ hospitalVisits: state.hospitalVisits.filter((r) => r.id !== id) }));
  },
}));
