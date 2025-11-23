
// src/services/EventLocationService.ts
import axios from "axios";
import privateApi from "@/services/api/privateApi";
import type {
  EventLocation,
  EventLocationConnector,
} from "@/types/events";

const API = "/api/v1";

export const EventLocationService = {
  // ─────────────────────────────────────────────
  // EventLocations index + creation
  // ─────────────────────────────────────────────
  async fetchEventLocations(): Promise<EventLocation[]> {
    const { data } = await axios.get<EventLocation[]>(`${API}/event_locations`);
    return data;
  },

  async createLocation(
    loc: Partial<EventLocation>
  ): Promise<EventLocation> {
    const { data } = await axios.post<EventLocation>(`${API}/event_locations`, {
      event_location: loc,
    });
    return data;
  },

  // ─────────────────────────────────────────────
  // Event–Location connectors (per event)
  // ─────────────────────────────────────────────
  async fetchLocationConnectors(
    eventId: number
  ): Promise<EventLocationConnector[]> {
    const { data } = await privateApi.get<EventLocationConnector[]>(
      `${API}/events/${eventId}/event_location_connectors`
    );
    return data;
  },

  async connectLocation(
    eventId: number,
    event_location_id: number,
    is_primary = false
  ): Promise<EventLocationConnector> {
    const { data } = await privateApi.post<EventLocationConnector>(
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
    attrs: Partial<{
      is_primary: boolean;
      status: "pending" | "confirmed" | "rejected";
    }>
  ): Promise<EventLocationConnector> {
    const { data } = await privateApi.put<EventLocationConnector>(
      `${API}/events/${eventId}/event_location_connectors/${connectorId}`,
      { event_location_connector: attrs }
    );
    return data;
  },

  async disconnectLocation(
    eventId: number,
    connectorId: number
  ): Promise<void> {
    await privateApi.delete(
      `${API}/events/${eventId}/event_location_connectors/${connectorId}`
    );
  },
};
