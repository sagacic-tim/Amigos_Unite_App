// src/services/EventService.ts
import {
  privateGet,
  privatePost,
  privatePut,
  privateDel,
} from '@/services/apiHelper';

import type { Event as EventModel } from '@/types/EventTypes';
import type { EventAmigoConnector } from '@/types/EventAmigoConnectorTypes';
import type { EventLocationConnector } from '@/types/EventLocationConnectorTypes';

// ─── Events ────────────────────────────────────
export const fetchEvents = (): Promise<EventModel[]> =>
  privateGet<EventModel[]>('/api/v1/events');

export const fetchEventById = (id: number): Promise<EventModel> =>
  privateGet<EventModel>(`/api/v1/events/${id}`);

export const createEvent = (data: Partial<EventModel>): Promise<EventModel> =>
  privatePost<EventModel>('/api/v1/events', data);

export const updateEvent = (
  id: number,
  data: Partial<EventModel>
): Promise<EventModel> =>
  privatePut<EventModel>(`/api/v1/events/${id}`, data);

export const deleteEvent = (id: number): Promise<void> =>
  privateDel<void>(`/api/v1/events/${id}`);

// ─── Event ↔ Amigo connectors ─────────────────
export const fetchEventAmigoConnectors = (
  eventId: number
): Promise<EventAmigoConnector[]> =>
  privateGet<EventAmigoConnector[]>(
    `/api/v1/events/${eventId}/event_amigo_connectors`
  );

export const createEventAmigoConnector = (
  eventId: number,
  data: { amigo_id: number }
): Promise<EventAmigoConnector> =>
  privatePost<EventAmigoConnector>(
    `/api/v1/events/${eventId}/event_amigo_connectors`,
    data
  );

export const deleteEventAmigoConnector = (
  eventId: number,
  connectorId: number
): Promise<void> =>
  privateDel<void>(
    `/api/v1/events/${eventId}/event_amigo_connectors/${connectorId}`
  );

// ─── Event ↔ Location connectors ──────────────
export const fetchEventLocationConnectors = (
  eventId: number
): Promise<EventLocationConnector[]> =>
  privateGet<EventLocationConnector[]>(
    `/api/v1/events/${eventId}/event_location_connectors`
  );

// Global list (no event filter) — used by the connectors pages
export const fetchAllEventLocationConnectors = ():
  Promise<EventLocationConnector[]> =>
  privateGet<EventLocationConnector[]>('/api/v1/event_location_connectors');

export const createEventLocationConnector = (
  eventId: number,
  data: { event_location_id: number }
): Promise<EventLocationConnector> =>
  privatePost<EventLocationConnector>(
    `/api/v1/events/${eventId}/event_location_connectors`,
    data
  );

export const deleteEventLocationConnector = (
  eventId: number,
  connectorId: number
): Promise<void> =>
  privateDel<void>(
    `/api/v1/events/${eventId}/event_location_connectors/${connectorId}`
  );

// Global list (no event filter) — used by the connectors pages
export const fetchAllEventAmigoConnectors = ():
  Promise<EventAmigoConnector[]> =>
  privateGet<EventAmigoConnector[]>('/api/v1/event_amigo_connectors');
