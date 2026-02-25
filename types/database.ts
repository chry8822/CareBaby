export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ─── Database Schema (Supabase CLI 방식: 모든 타입 인라인 정의) ───────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          premium_expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          avatar_url?: string | null;
          premium_expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          premium_expires_at?: string | null;
        };
        Relationships: [];
      };
      babies: {
        Row: {
          id: string;
          name: string;
          birth_date: string;
          gender: 'male' | 'female' | 'unknown';
          avatar_url: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          birth_date: string;
          gender: 'male' | 'female' | 'unknown';
          avatar_url?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          birth_date?: string;
          gender?: 'male' | 'female' | 'unknown';
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      caretakers: {
        Row: {
          id: string;
          baby_id: string;
          profile_id: string;
          role: 'owner' | 'caretaker';
          invite_code: string | null;
          invite_expires_at: string | null;
          joined_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          profile_id: string;
          role: 'owner' | 'caretaker';
          invite_code?: string | null;
          invite_expires_at?: string | null;
          joined_at?: string;
        };
        Update: {
          role?: 'owner' | 'caretaker';
          invite_code?: string | null;
          invite_expires_at?: string | null;
        };
        Relationships: [];
      };
      feedings: {
        Row: {
          id: string;
          baby_id: string;
          recorded_by: string;
          feeding_type: 'breast_left' | 'breast_right' | 'pumped' | 'formula';
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          amount_ml: number | null;
          memo_tags: string[] | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          recorded_by: string;
          feeding_type: 'breast_left' | 'breast_right' | 'pumped' | 'formula';
          started_at: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          amount_ml?: number | null;
          memo_tags?: string[] | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          feeding_type?: 'breast_left' | 'breast_right' | 'pumped' | 'formula';
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          amount_ml?: number | null;
          memo_tags?: string[] | null;
          note?: string | null;
        };
        Relationships: [];
      };
      sleeps: {
        Row: {
          id: string;
          baby_id: string;
          recorded_by: string;
          sleep_type: 'nap' | 'night';
          started_at: string;
          ended_at: string | null;
          duration_seconds: number | null;
          memo_tags: string[] | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          recorded_by: string;
          sleep_type: 'nap' | 'night';
          started_at: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          memo_tags?: string[] | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          sleep_type?: 'nap' | 'night';
          started_at?: string;
          ended_at?: string | null;
          duration_seconds?: number | null;
          memo_tags?: string[] | null;
          note?: string | null;
        };
        Relationships: [];
      };
      diapers: {
        Row: {
          id: string;
          baby_id: string;
          recorded_by: string;
          diaper_type: 'wet' | 'dirty' | 'both';
          occurred_at: string;
          memo_tags: string[] | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          recorded_by: string;
          diaper_type: 'wet' | 'dirty' | 'both';
          occurred_at: string;
          memo_tags?: string[] | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          diaper_type?: 'wet' | 'dirty' | 'both';
          occurred_at?: string;
          memo_tags?: string[] | null;
          note?: string | null;
        };
        Relationships: [];
      };
      growths: {
        Row: {
          id: string;
          baby_id: string;
          recorded_by: string;
          measured_at: string;
          weight_g: number | null;
          height_mm: number | null;
          head_circumference_mm: number | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          recorded_by: string;
          measured_at: string;
          weight_g?: number | null;
          height_mm?: number | null;
          head_circumference_mm?: number | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          measured_at?: string;
          weight_g?: number | null;
          height_mm?: number | null;
          head_circumference_mm?: number | null;
          note?: string | null;
        };
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          baby_id: string;
          recorded_by: string;
          milestone_type: string;
          title: string;
          occurred_at: string;
          note: string | null;
          photo_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          recorded_by: string;
          milestone_type: string;
          title: string;
          occurred_at: string;
          note?: string | null;
          photo_url?: string | null;
          created_at?: string;
        };
        Update: {
          milestone_type?: string;
          title?: string;
          occurred_at?: string;
          note?: string | null;
          photo_url?: string | null;
        };
        Relationships: [];
      };
      vaccinations: {
        Row: {
          id: string;
          baby_id: string;
          vaccine_name: string;
          scheduled_at: string;
          completed_at: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          vaccine_name: string;
          scheduled_at: string;
          completed_at?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          vaccine_name?: string;
          scheduled_at?: string;
          completed_at?: string | null;
          note?: string | null;
        };
        Relationships: [];
      };
      custom_memo_tags: {
        Row: {
          id: string;
          baby_id: string;
          category: 'feeding' | 'sleep' | 'diaper';
          label: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          baby_id: string;
          category: 'feeding' | 'sleep' | 'diaper';
          label: string;
          created_at?: string;
        };
        Update: {
          category?: 'feeding' | 'sleep' | 'diaper';
          label?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_invite_code: {
        Args: { baby_id: string };
        Returns: string;
      };
      join_by_invite_code: {
        Args: { code: string };
        Returns: { success: boolean; baby_id: string | null };
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ─── 편의용 타입 별칭: Database 스키마에서 파생 ────────────────────────────────

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type BabyGender = 'male' | 'female' | 'unknown';
export type Baby = Database['public']['Tables']['babies']['Row'];
export type BabyInsert = Database['public']['Tables']['babies']['Insert'];
export type BabyUpdate = Database['public']['Tables']['babies']['Update'];

export type CaretakerRole = 'owner' | 'caretaker';
export type Caretaker = Database['public']['Tables']['caretakers']['Row'];
export type CaretakerInsert = Database['public']['Tables']['caretakers']['Insert'];
export type CaretakerUpdate = Database['public']['Tables']['caretakers']['Update'];

export type FeedingType = 'breast_left' | 'breast_right' | 'pumped' | 'formula';
export type Feeding = Database['public']['Tables']['feedings']['Row'];
export type FeedingInsert = Database['public']['Tables']['feedings']['Insert'];
export type FeedingUpdate = Database['public']['Tables']['feedings']['Update'];

export type SleepType = 'nap' | 'night';
export type Sleep = Database['public']['Tables']['sleeps']['Row'];
export type SleepInsert = Database['public']['Tables']['sleeps']['Insert'];
export type SleepUpdate = Database['public']['Tables']['sleeps']['Update'];

export type DiaperType = 'wet' | 'dirty' | 'both';
export type Diaper = Database['public']['Tables']['diapers']['Row'];
export type DiaperInsert = Database['public']['Tables']['diapers']['Insert'];
export type DiaperUpdate = Database['public']['Tables']['diapers']['Update'];

export type Growth = Database['public']['Tables']['growths']['Row'];
export type GrowthInsert = Database['public']['Tables']['growths']['Insert'];
export type GrowthUpdate = Database['public']['Tables']['growths']['Update'];

export type Milestone = Database['public']['Tables']['milestones']['Row'];
export type MilestoneInsert = Database['public']['Tables']['milestones']['Insert'];
export type MilestoneUpdate = Database['public']['Tables']['milestones']['Update'];

export type Vaccination = Database['public']['Tables']['vaccinations']['Row'];
export type VaccinationInsert = Database['public']['Tables']['vaccinations']['Insert'];
export type VaccinationUpdate = Database['public']['Tables']['vaccinations']['Update'];

export type MemoTagCategory = 'feeding' | 'sleep' | 'diaper';
export type CustomMemoTag = Database['public']['Tables']['custom_memo_tags']['Row'];
export type CustomMemoTagInsert = Database['public']['Tables']['custom_memo_tags']['Insert'];
export type CustomMemoTagUpdate = Database['public']['Tables']['custom_memo_tags']['Update'];

// ─── 유니온 타입 ──────────────────────────────────────────────────────────────

export type AnyRecord = Feeding | Sleep | Diaper | Growth | Milestone;
export type RecordType = 'feeding' | 'sleep' | 'diaper' | 'growth' | 'milestone';
