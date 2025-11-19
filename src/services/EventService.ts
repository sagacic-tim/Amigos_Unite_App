// src/services/EventService.ts
import axios from 'axios';
import privateApi from '@/services/privateApi';
import type {
  Event,
  EventCreateParams,
  EventAmigoConnector,
  EventLocation,
  EventLocationConnector,
  AmigoMinimal,
} from '@/types/events';

const API = '/api/v1';

export const EventService = {
  // --- Events ---
  async list(params?: { status?: string; upcoming_only?: boolean }) {
    const { data } = await axios.get<Event[]>(`${API}/events`, { params });
    return data;
  },

  async get(id: number) {
    const { data } = await axios.get<Event>(`${API}/events/${id}`);
    return data;
  },

  async create(payload: EventCreateParams) {
    const { data } = await axios.post<Event>(`${API}/events`, { event: payload });
    return data;
  },

  async update(
    id: number,
    attrs: Partial<EventCreateParams> & { new_lead_coordinator_id?: number }
  ) {
    const { data } = await axios.put<Event>(`${API}/events/${id}`, {
      event: attrs,
      new_lead_coordinator_id: attrs['new_lead_coordinator_id'],
    });
    return data;
  },

  async destroy(id: number) {
    await axios.delete(`${API}/events/${id}`);
  },

  // --- Membership (EventAmigoConnectors) ---
  async listConnectors(eventId: number) {
    const { data } = await axios.get<EventAmigoConnector[]>(
      `${API}/events/${eventId}/event_amigo_connectors`
    );
    return data;
  },

  async registerSelf(eventId: number) {
    const { data } = await axios.post<EventAmigoConnector>(
      `${API}/events/${eventId}/event_amigo_connectors`,
      {}
    );
    return data;
  },

  async changeRole(
    eventId: number,
    connectorId: number,
    newRole: 'participant' | 'assistant_coordinator' | 'lead_coordinator'
  ) {
    const { data } = await axios.put<EventAmigoConnector>(
      `${API}/events/${eventId}/event_amigo_connectors/${connectorId}`,
      { event_amigo_connector: { role: newRole } }
    );
    return data;
  },

  async leave(eventId: number, connectorId: number) {
    await axios.delete(`${API}/events/${eventId}/event_amigo_connectors/${connectorId}`);
  },

  // 🔹 Global connectors list (the function you care about)
  async fetchAllEventAmigoConnectors(): Promise<EventAmigoConnector[]> {
    const res = await privateApi.get('/event_amigo_connectors');
    return res.data.event_amigo_connectors ?? res.data.data ?? res.data;
  },

  // 🔹 Global location connectors list
  async fetchAllEventLocationConnectors(): Promise<EventLocationConnector[]> {
    const res = await privateApi.get('/event_location_connectors');
    return res.data.event_location_connectors ?? res.data.data ?? res.data;
  },

  // --- Locations ---
  async listLocationConnectors(eventId: number) {
    const { data } = await axios.get<EventLocationConnector[]>(
      `${API}/events/${eventId}/event_location_connectors`
    );
    return data;
  },

  async connectLocation(eventId: number, event_location_id: number, is_primary = false) {
    const { data } = await axios.post<EventLocationConnector>(
      `${API}/events/${eventId}/event_location_connectors`,
      {
        event_location_connector: { event_location_id, is_primary },
      }
    );
    return data;
  },

  async updateLocationConnector(
    eventId: number,
    connectorId: number,
    attrs: Partial<{ is_primary: boolean; status: 'pending' | 'confirmed' | 'rejected' }>
  ) {
    const { data } = await axios.put<EventLocationConnector>(
      `${API}/events/${eventId}/event_location_connectors/${connectorId}`,
      { event_location_connector: attrs }
    );
    return data;
  },

  async disconnectLocation(eventId: number, connectorId: number) {
    await axios.delete(`${API}/events/${eventId}/event_location_connectors/${connectorId}`);
  },
};

export async function createEvent(params: EventCreateParams): Promise<Event> {
  const res = await privateApi.post("/api/v1/events", { event: params });
  return res.data.event ?? res.data; // however your API structures it
}

// Separate service for locations themselves:
export const EventLocationService = {
  async create(loc: Partial<EventLocation>) {
    const { data } = await axios.post<EventLocation>(`${API}/event_locations`, {
      event_location: loc,
    });
    return data;
  },
};

// For navigation gating:
export const MyEventsService = {
  async hasManagedEvents(): Promise<boolean> {
    const { data } = await axios.get<Event[]>(`${API}/events`, {
      params: { managed_by: 'me', limit: 1 },
    });
    return (data?.length ?? 0) > 0;
  },
};

// Convenience wrapper for the Events index
export async function fetchEvents(
  params?: { status?: string; upcoming_only?: boolean }): Promise<Event[]> {
    return EventService.list(params);
}

