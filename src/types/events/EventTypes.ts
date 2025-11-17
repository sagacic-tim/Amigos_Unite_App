
export type EventRole = 'participant' | 'assistant_coordinator' | 'lead_coordinator';
export type EventMembershipStatus = 'pending' | 'confirmed' | 'declined';
export type EventStatus = 'planning' | 'active' | 'completed' | 'canceled';

export interface AmigoMinimal {
  id: number;
  user_name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  avatar_url?: string;
  admin?: boolean;
}

export interface Event {
  id: number;
  event_name: string;
  event_date: string;  // ISO date e.g. "2025-11-13"
  event_time: string;  // "HH:MM:SS"
  status: EventStatus;
  lead_coordinator_id?: number | null;

  // Optional expansions (index/show payload convenience)
  event_type?: string | null;
  event_speakers_performers?: string[] | null;
  created_at?: string;
  updated_at?: string;
  lead_coordinator?: AmigoMinimal | null;

  // Optional related aggregates
  event_amigo_connectors?: import('./EventAmigoConnectorTypes').EventAmigoConnector[];
  event_location_connectors?: import('./EventLocationConnectorTypes').EventLocationConnector[];
  primary_event_location?: import('./EventLocationTypes').EventLocation | null;
}

export interface EventCreateParams {
  event_name: string;
  event_date: string;  // "YYYY-MM-DD"
  event_time: string;  // "HH:MM" or "HH:MM:SS"
  status?: EventStatus;
  event_type?: string;
  event_speakers_performers?: string[];
}
