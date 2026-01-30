export type ProfileRole = "admin" | "customer";

export interface Profile {
  id: string;
  email: string;
  role: ProfileRole;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export type SlotProfile = {
  display_name: string | null;
  email: string;
};

export interface Slot {
  id: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
  created_at: string;
  /** Supabase の FK リレーションは配列で返る場合がある */
  profiles?: SlotProfile | SlotProfile[] | null;
}
