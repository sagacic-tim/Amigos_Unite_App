// src/services/EventService.ts
import axios from "axios";
import privateApi from "@/services/api/privateApi";
import type {
  Event,
  EventCreateParams,
  EventAmigoConnector,
  EventLocation,
  EventLocationConnector,
} from "@/types/events";

const API = "/api/v1";

export const EventService = {
  // ─────────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────────
  async fetchEvents(params?: { status?: string; upcoming_only?: boolean }) {
    const { data } = await axios.get<Event[]>(`${API}/events`, { params });
    return data;
  },

  async fetchEvent(id: number) {
    const { data } = await axios.get<Event>(`${API}/events/${id}`);
    return data;
  },

  async createEvent(payload: EventCreateParams) {
    const { data } = await privateApi.post(`${API}/events`, {
      event: payload,
    });
    // If your API wraps as { event: ... }, prefer that; otherwise this is fine:
    return (data as any).event ?? data;
  },

  async updateEvent(
    id: number,
    attrs: Partial<EventCreateParams> & { new_lead_coordinator_id?: number }
  ) {
    const { data } = await privateApi.put(`${API}/events/${id}`, {
      event: attrs,
      new_lead_coordinator_id: attrs["new_lead_coordinator_id"],
    });
    return (data as any).event ?? data;
  },

  async deleteEvent(id: number) {
    await privateApi.delete(`${API}/events/${id}`);
  },

  // ─────────────────────────────────────────────
  // Event–Amigo connectors
  // ─────────────────────────────────────────────
  async fetchEventConnectors(eventId: number) {
    const { data } = await privateApi.get<EventAmigoConnector[]>(
      `${API}/events/${eventId}/event_amigo_connectors`
    );
    return data;
  },

  async registerSelf(eventId: number) {
    const { data } = await privateApi.post<EventAmigoConnector>(
      `${API}/events/${eventId}/event_amigo_connectors`,
      {}
    );
    return data;
  },

  async changeRole(
    eventId: number,
    connectorId: number,
    newRole: "participant" | "assistant_coordinator" | "lead_coordinator"
  ) {
const { data } = await privateApi.put<EventAmigoConnector>(
      `${API}/events/${eventId}/event_amigo_connectors/${connectorId}`,
      { event_amigo_connector: { role: newRole } }
    );
    return data;
  },

  async leave(eventId: number, connectorId: number) {
    await privateApi.delete(
      `${API}/events/${eventId}/event_amigo_connectors/${connectorId}`
    );
  },

  // Global lists for debugging/admin:
  async fetchAllEventAmigoConnectors(): Promise<EventAmigoConnector[]> {
    const res = await privateApi.get("/event_amigo_connectors");
    return res.data.event_amigo_connectors ?? res.data.data ?? res.data;
  },

  async fetchAllEventLocationConnectors(): Promise<EventLocationConnector[]> {
    const res = await privateApi.get("/event_location_connectors");
    return res.data.event_location_connectors ?? res.data.data ?? res.data;
  },
};

export { EventLocationService } from "@/services/EventLocationService";
