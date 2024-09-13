// src/types/EventTypes.ts

export interface Amigo {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  secondary_email?: string;
  phone_1?: string;
  phone_2?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: number;
  event_name: string;
  event_type: string;
  event_speakers_performers: string[];
  event_date: string;
  event_time: string;
  lead_coordinator: Amigo;
  created_at: string;
  updated_at: string;
}