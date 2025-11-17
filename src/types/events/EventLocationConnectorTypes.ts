
import type { EventLocation } from './EventLocationTypes';

export interface EventLocationConnector {
  id: number;
  event_id: number;
  event_location_id: number;
  is_primary: boolean;
  status: 'pending' | 'confirmed' | 'rejected';
  event_location?: EventLocation; // optional expansion from API
}
