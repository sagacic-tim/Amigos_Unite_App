// src/services/PlacesService.ts
import privateApi from "@/services/api/privateApi";

export type PlaceResult = {
  place_id: string;
  name: string;
  formatted_address: string;

  // Map-friendly fields (optional for now; backend can add them):
  lat?: number | null;
  lng?: number | null;

  // Optional primary photo reference for future use:
  primary_photo_reference?: string | null;

  // Optional lightweight preview fields if backend chooses to send them:
  photo_url?: string | null;
  photo_attribution?: string | null;
};

export type PlacePhoto = {
  place_id: string;
  photo_reference?: string | null;
  photo_url?: string | null;
  photo_attribution?: string | null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers to unwrap flexible backend payload shapes
// ─────────────────────────────────────────────────────────────────────────────

function unwrapPlaceResults(payload: unknown): PlaceResult[] {
  if (Array.isArray(payload)) {
    return payload as PlaceResult[];
  }

  if (payload && typeof payload === "object") {
    const results = (payload as { results?: unknown }).results;
    if (Array.isArray(results)) {
      return results as PlaceResult[];
    }
  }

  return [];
}

function unwrapPlacePhotos(payload: unknown): PlacePhoto[] {
  if (Array.isArray(payload)) {
    return payload as PlacePhoto[];
  }

  if (payload && typeof payload === "object") {
    const photos = (payload as { photos?: unknown }).photos;
    if (Array.isArray(photos)) {
      return photos as PlacePhoto[];
    }
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────────────────────────────────────

// Canonical function name going forward.
// You can use this directly in new code.
export async function searchPlaces(
  query: string,
  type?: string
): Promise<PlaceResult[]> {
  if (!query.trim()) return [];

  const response = await privateApi.get("/api/v1/places/search", {
    params: { q: query, type },
    withCredentials: true,
  });

  const data: unknown = response.data;
  return unwrapPlaceResults(data);
}

// Backwards-compatible alias for existing call sites.
export async function searchPlacesWithPhotos(
  query: string,
  type?: string
): Promise<PlaceResult[]> {
  return searchPlaces(query, type);
}

export async function fetchPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  if (!placeId) return [];

  const response = await privateApi.get(`/api/v1/places/${placeId}/photos`, {
    withCredentials: true,
  });

  const data: unknown = response.data;
  return unwrapPlacePhotos(data);
}
