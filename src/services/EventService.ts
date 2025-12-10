// src/services/EventService.ts //
import privateApi from "@/services/api/privateApi";
import publicApi from "@/services/api/publicApi";
import type {
  Event,
  EventCreateParams,
  EventStatus,
} from "@/types/events/EventTypes";
import type { EventLocation } from "@/types/events/EventLocationTypes";
import type { EventAmigoConnector } from "@/types/events";

const API_PREFIX = "/api/v1";

// ─────────────────────────────────────────────────────────────────────────────
// JSON:API types for Events / EventLocations
// ─────────────────────────────────────────────────────────────────────────────

type JsonApiResourceIdentifier = {
  id: string;
  type: string;
};

interface JsonApiEventAttributes {
  "event-name": string;
  "event-date": string;
  "event-time": string;
  status: EventStatus;

  "event-type"?: string | null;
  "event-speakers-performers"?: string[] | null;
  description?: string | null;
  "status-label"?: string;

  "lead-coordinator-id"?: number | null;

  "formatted-event-date"?: string;
  "formatted-event-time"?: string;

  "created-at"?: string;
  "updated-at"?: string;
}

interface JsonApiEventRelationships {
  "lead-coordinator"?: {
    data: JsonApiResourceIdentifier | null;
  };
  "primary-event-location"?: {
    data: JsonApiResourceIdentifier | null;
  };
}

interface JsonApiEventResource {
  id: string;
  type: "events";
  attributes: JsonApiEventAttributes;
  relationships?: JsonApiEventRelationships;
}

interface JsonApiEventLocationAttributes {
  "business-name": string;
  "location-type"?: string | null;
  "business-phone"?: string | null;

  address?: string | null;
  floor?: string | null;
  "street-number"?: string | null;
  "street-name"?: string | null;
  "room-no"?: string | null;
  "apartment-suite-number"?: string | null;

  "city-sublocality"?: string | null;
  city?: string | null;
  "state-province-subdivision"?: string | null;
  "state-province"?: string | null;
  "state-province-short"?: string | null;
  country?: string | null;
  "country-short"?: string | null;
  "postal-code"?: string | null;
  "postal-code-suffix"?: string | null;
  "post-box"?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  "time-zone"?: string | null;

  "owner-name"?: string | null;
  capacity?: number | null;
  "capacity-seated"?: number | null;
  "availability-notes"?: string | null;
  "has-food"?: boolean;
  "has-drink"?: boolean;
  "has-internet"?: boolean;
  "has-big-screen"?: boolean;
  "place-id"?: string | null;
  services?: string[] | null;

  "location-image-url"?: string | null;
  "location-image-attribution"?: string | null;

  "created-at": string;
  "updated-at": string;
}

interface JsonApiEventLocationResource {
  id: string;
  type: "event-locations";
  attributes: JsonApiEventLocationAttributes;
}

interface JsonApiIndexResponse {
  data: JsonApiEventResource[];
}

interface JsonApiShowResponse {
  data: JsonApiEventResource;
  included?: (JsonApiEventLocationResource | any)[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalizers
// ─────────────────────────────────────────────────────────────────────────────

function normalizeEventLocation(
  resource: JsonApiEventLocationResource
): EventLocation {
  const a = resource.attributes;

  return {
    id: Number(resource.id),

    location_type: a["location-type"] ?? null,
    business_name: a["business-name"],
    business_phone: a["business-phone"] ?? null,

    address: a.address ?? null,
    floor: a.floor ?? null,
    street_number: a["street-number"] ?? null,
    street_name: a["street-name"] ?? null,
    room_no: a["room-no"] ?? null,
    apartment_suite_number: a["apartment-suite-number"] ?? null,

    city_sublocality: a["city-sublocality"] ?? null,
    city: a.city ?? null,
    state_province_subdivision: a["state-province-subdivision"] ?? null,
    state_province: a["state-province"] ?? null,
    state_province_short: a["state-province-short"] ?? null,
    country: a.country ?? null,
    country_short: a["country-short"] ?? null,
    postal_code: a["postal-code"] ?? null,
    postal_code_suffix: a["postal-code-suffix"] ?? null,
    post_box: a["post-box"] ?? null,

    latitude: a.latitude ?? null,
    longitude: a.longitude ?? null,
    time_zone: a["time-zone"] ?? null,

    owner_name: a["owner-name"] ?? null,
    capacity: a.capacity ?? null,
    capacity_seated: a["capacity-seated"] ?? null,
    availability_notes: a["availability-notes"] ?? null,
    has_food: a["has-food"],
    has_drink: a["has-drink"],
    has_internet: a["has-internet"],
    has_big_screen: a["has-big-screen"],
    place_id: a["place-id"] ?? null,
    services: a.services ?? undefined,

    location_image_url: a["location-image-url"] ?? null,
    location_image_attribution: a["location-image-attribution"] ?? null,

    created_at: a["created-at"],
    updated_at: a["updated-at"],
  };
}

function normalizeEvent(
  resource: JsonApiEventResource,
  included?: JsonApiEventLocationResource[]
): Event {
  const a = resource.attributes;
  const relationships = resource.relationships ?? {};

  // Hydrate primary_event_location from relationships + included
  let primaryLocation: EventLocation | null = null;

  const primaryRel =
    relationships["primary-event-location"]
      ?.data as JsonApiResourceIdentifier | null | undefined;

  if (primaryRel && primaryRel.type === "event-locations" && included) {
    const locRes = included.find(
      (r: JsonApiEventLocationResource) =>
        r.type === "event-locations" && r.id === primaryRel.id
    );
    if (locRes) {
      primaryLocation = normalizeEventLocation(locRes);
    }
  }

  return {
    id: Number(resource.id),
    event_name: a["event-name"],
    event_date: a["event-date"],
    event_time: a["formatted-event-time"] ?? a["event-time"],
    status: a.status,
    lead_coordinator_id: a["lead-coordinator-id"] ?? null,

    formatted_event_date: a["formatted-event-date"] ?? a["event-date"],
    formatted_event_time: a["formatted-event-time"],
    status_label: a["status-label"],

    event_type: a["event-type"] ?? null,
    event_speakers_performers: a["event-speakers-performers"] ?? [],
    description: a.description ?? null,

    created_at: a["created-at"],
    updated_at: a["updated-at"],

    // These can be hydrated later if you include them in the payload
    lead_coordinator: null,
    event_amigo_connectors: [],
    event_location_connectors: [],
    primary_event_location: primaryLocation,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Service API
// ─────────────────────────────────────────────────────────────────────────────

export const EventService = {
  // Index (events only – no includes)
  async fetchEvents(): Promise<Event[]> {
    const res = await publicApi.get<JsonApiIndexResponse>(
      `${API_PREFIX}/events`
    );
    const resources = Array.isArray(res.data.data) ? res.data.data : [];
    return resources.map((r) => normalizeEvent(r));
  },

  // Show (includes primary_event_location)
  async fetchEvent(id: number): Promise<Event> {
    const res = await publicApi.get<JsonApiShowResponse>(
      `${API_PREFIX}/events/${id}`
    );
    const included = (res.data.included || []).filter(
      (r: any): r is JsonApiEventLocationResource =>
        r && r.type === "event-locations"
    );
    return normalizeEvent(res.data.data, included);
  },

  // Create (expects { event: EventCreateParams } and returns JSON:API event)
  async createEvent(params: EventCreateParams): Promise<Event> {
    const res = await privateApi.post<JsonApiShowResponse>(
      `${API_PREFIX}/events`,
      {
      event: params,
    });
    const included = (res.data.included || []).filter(
      (r: any): r is JsonApiEventLocationResource =>
        r && r.type === "event-locations"
    );
    return normalizeEvent(res.data.data, included);
  },

  // Update
  async updateEvent(id: number, params: EventCreateParams): Promise<Event> {
    const res = await privateApi.put<JsonApiShowResponse>(
      `${API_PREFIX}/events/${id}`, {
      event: params,
    });
    const included = (res.data.included || []).filter(
      (r: any): r is JsonApiEventLocationResource =>
        r && r.type === "event-locations"
    );
    return normalizeEvent(res.data.data, included);
  },

  /**
   * Register the given amigo as a participant on an event.
   * Hits: POST /api/v1/events/:event_id/event_amigo_connectors
   */
  async registerForEvent(
    eventId: number,
    amigoId: number
  ): Promise<EventAmigoConnector> {
    const res = await privateApi.post(
      `${API_PREFIX}/events/${eventId}/event_amigo_connectors`,
      {
        event_amigo_connector: {
          amigo_id: amigoId,
          role: "participant",
        },
      }
    );
    return res.data;
  },

  /**
   * Register the current amigo for an event via the /events/:id/register_self
   * endpoint (if you keep this route). This is more “semantic”, whereas
   * registerForEvent works directly with the connectors endpoint.
   * legacy; no matching route defined yet.
   */
  async registerSelf(eventId: number, options?: any): Promise<any> {
    const res = await privateApi.post(
      `${API_PREFIX}/events/${eventId}/register_self`,
      {
        ...(options || {}),
      }
    );
    return res.data;
  },

  async fetchEventAmigoConnectors(eventId: number): Promise<EventAmigoConnector[]> {
    const res = await privateApi.get(
      `${API_PREFIX}/events/${eventId}/event_amigo_connectors`
    );
    const payload: any = res.data;

    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },

  /**
   * Global/debug listing of ALL EventAmigoConnectors.
   * Hits: GET /api/v1/event_amigo_connectors
   * (You will need a matching top-level route in Rails.)
   */
  async fetchAllEventAmigoConnectors(): Promise<EventAmigoConnector[]> {
    const res = await privateApi.get(
      `${API_PREFIX}/event_amigo_connectors`,
    );
    const payload: any = res.data;

    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },


  async fetchAllEventLocationConnectors(): Promise<any[]> {
    const res = await privateApi.get(
      `${API_PREFIX}/event_location_connectors`
    );
    const payload: any = res.data;

    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.data)) return payload.data;
    return [];
  },

  async leave(eventId: number): Promise<any> {
    // Example: DELETE /events/:id/leave
    const res = await privateApi.delete(
      `${API_PREFIX}/events/${eventId}/leave`
    );
    return res.data;
  },

  /**
   * Delete an event.
   */
  async deleteEvent(id: number): Promise<void> {
    await privateApi.delete(`${API_PREFIX}/events/${id}`);
  },
};
