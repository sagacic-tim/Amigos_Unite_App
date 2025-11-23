// src/types/events/EventAmigoConnectorTypes.ts
import type {
  EventRole,
  EventMembershipStatus,
  AmigoMinimal,
} from "./EventTypes";

export interface EventAmigoConnector {
  id:       number;
  event_id: number;
  amigo_id: number;
  role:     EventRole;
  status:   EventMembershipStatus;

  amigo?: AmigoMinimal; // optional expansion from API
  created_at?: string;
  updated_at?: string;
}
