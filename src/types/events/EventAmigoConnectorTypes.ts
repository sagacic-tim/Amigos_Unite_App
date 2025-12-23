// src/types/events/EventAmigoConnectorTypes.ts
import type { EventRole, EventMembershipStatus } from "./EventTypes";

/**
 * Minimal amigo payload that gets embedded on an EventAmigoConnector.
 * This is a "snapshot" of the Amigo for this event context.
 */
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

  /**
   * Profile-level willingness flag (mirrors the AmigoDetail preference).
   * Kept generic so the backend can map from e.g. amigo_detail.willing_to_help.
   */
  willing_to_help?: boolean | null;

  /**
   * Optional future-proof alias if your API ever exposes a more specific flag
   * (e.g. amigo_detail.willing_to_help_with_events). Safe to leave as optional.
   */
  willing_to_help_with_events?: boolean | null;
}

/**
 * Join model between Event and Amigo.
 * This is where the amigo's role on THIS event is defined.
 */
export interface EventAmigoConnector {
  id: number;
  event_id: number;
  amigo_id: number;

  /** Role on this event: "lead_coordinator" | "assistant_coordinator" | "participant" | ... */
  role: EventRole;

  /** Membership status on this event: "invited", "confirmed", "declined", etc. */
  status: EventMembershipStatus;

  /** Optional embedded amigo payload for display purposes. */
  amigo?: EventConnectorAmigo;

  created_at?: string;
  updated_at?: string;
}

/**
 * Convenience type for places that *require* amigo to be present
 * (e.g. participant listings where we always display name/email/avatar).
 */
export type EventAmigoConnectorWithAmigo = EventAmigoConnector & {
  amigo: EventConnectorAmigo;
};
