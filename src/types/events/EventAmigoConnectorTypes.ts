// src/types/events/EventAmigoConnectorTypes.ts
import type {
  EventRole,
  EventMembershipStatus,
} from "./EventTypes";

export interface EventConnectorAmigo {
  id: number;
  user_name: string;

  first_name?: string | null;
  last_name?: string | null;

  email?: string | null;
  secondary_email?: string | null;

  phone_1?: string | null;
  phone_2?: string | null;

  avatar_url?: string | null;
}

export interface EventAmigoConnector {
  id:       number;
  event_id: number;
  amigo_id: number;
  role:     EventRole;
  status:   EventMembershipStatus;

  amigo?: EventConnectorAmigo;
  created_at?: string;
  updated_at?: string;
}
