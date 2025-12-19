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

  const data = response.data;
  if (Array.isArray(data)) return data as PlaceResult[];
  if (Array.isArray((data as any)?.results)) return (data as any).results as PlaceResult[];
  return [];
}

// Backwards-compatible alias for existing call sites.
export async function searchPlacesWithPhotos(
  query: string,
  type?: string
): Promise<PlaceResult[]> {
  return searchPlaces(query, type);
}

export type PlacePhoto = {
  place_id: string;
  photo_reference?: string | null;
  photo_url?: string | null;
  photo_attribution?: string | null;
};

export async function fetchPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  if (!placeId) return [];

  const response = await privateApi.get(`/api/v1/places/${placeId}/photos`, {
    withCredentials: true,
  });

  const data = response.data;
  if (Array.isArray(data)) return data as PlacePhoto[];
  if (Array.isArray((data as any)?.photos)) return (data as any).photos as PlacePhoto[];
  return [];
}
