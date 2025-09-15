// src/types/EventTypes.ts
import type { Amigo } from './AmigoTypes';

// Core event model
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

// Re-export related connector types so consumers can import from one place
export type { EventLocationConnector } from './EventLocationConnectorTypes';
export type { EventAmigoConnector }    from './EventAmigoConnectorTypes';
