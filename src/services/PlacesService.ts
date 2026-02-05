// src/services/PlacesService.ts
import privateApi from "@/services/api/privateApi";
import axios from "axios";

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
  if (Array.isArray(payload)) return payload as PlaceResult[];

  if (payload && typeof payload === "object") {
    const results = (payload as { results?: unknown }).results;
    if (Array.isArray(results)) return results as PlaceResult[];
  }

  return [];
}

function unwrapPlacePhotos(payload: unknown): PlacePhoto[] {
  if (Array.isArray(payload)) return payload as PlacePhoto[];

  if (payload && typeof payload === "object") {
    const photos = (payload as { photos?: unknown }).photos;
    if (Array.isArray(photos)) return photos as PlacePhoto[];
  }

  return [];
}

// ─────────────────────────────────────────────────────────────────────────────
// Error handling / retry helpers
// ─────────────────────────────────────────────────────────────────────────────

type PlacesServiceError = Error & {
  status?: number;
  requestId?: string;
  details?: unknown;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status?: number): boolean {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function extractRequestId(headers: unknown): string | undefined {
  if (!headers || typeof headers !== "object") return undefined;
  const h = headers as Record<string, unknown>;
  const candidates = ["x-request-id", "x-correlation-id", "x-amzn-trace-id"];
  for (const k of candidates) {
    const v = h[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return undefined;
}

function extractServerMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";

  const d = data as Record<string, unknown>;

  // common shapes
  if (typeof d.error === "string") return d.error;
  if (typeof d.message === "string") return d.message;

  // your “status” envelope variants
  const status = d.status;
  if (status && typeof status === "object") {
    const s = status as Record<string, unknown>;
    if (typeof s.message === "string") return s.message;
    const errors = s.errors;
    if (Array.isArray(errors) && errors.length) {
      return errors.map((e) => (typeof e === "string" ? e : String(e))).join(", ");
    }
  }

  const errors = d.errors;
  if (Array.isArray(errors) && errors.length) {
    return errors.map((e) => (typeof e === "string" ? e : String(e))).join(", ");
  }

  return "";
}

function toPlacesError(err: unknown, fallbackMessage: string): PlacesServiceError {
  if (!axios.isAxiosError(err)) {
    const e = new Error(fallbackMessage) as PlacesServiceError;
    e.details = err;
    return e;
  }

  const status = err.response?.status;
  const data = err.response?.data;
  const requestId = extractRequestId(err.response?.headers);

  const serverMsg = extractServerMessage(data);
  const message =
    serverMsg ||
    (status ? `${fallbackMessage} (HTTP ${status})` : fallbackMessage);

  const e = new Error(message) as PlacesServiceError;
  e.status = status;
  e.requestId = requestId;
  e.details = data;
  return e;
}

// ─────────────────────────────────────────────────────────────────────────────
// Service functions
// ─────────────────────────────────────────────────────────────────────────────

// Canonical function name going forward.
export async function searchPlaces(query: string, type?: string): Promise<PlaceResult[]> {
  if (!query.trim()) return [];

  const response = await privateApi.get("/api/v1/places/search", {
    params: { q: query, type },
    withCredentials: true,
  });

  return unwrapPlaceResults(response.data as unknown);
}

// Backwards-compatible alias for existing call sites.
export async function searchPlacesWithPhotos(query: string, type?: string): Promise<PlaceResult[]> {
  return searchPlaces(query, type);
}

/**
 * New: Retry wrapper for VPS/prod transient failures (503/502/504) and rate limiting (429).
 *
 * - Default retries: 2 (total attempts = 3)
 * - Backoff: exponential (250ms, 500ms, 1000ms...) with a small jitter
 *
 * This does NOT “fix” a missing Google key on the server, but it does:
 * - eliminate flaky transient 503s, and
 * - give you a better surfaced error (incl. request id) when the server is truly misconfigured.
 */
export async function searchPlacesWithRetry(
  query: string,
  type?: string,
  opts?: { retries?: number; baseDelayMs?: number }
): Promise<PlaceResult[]> {
  const retries = Math.max(0, opts?.retries ?? 2);
  const baseDelayMs = Math.max(50, opts?.baseDelayMs ?? 250);

  let attempt = 0;

  for (; attempt <= retries; attempt += 1) {
    try {
      return await searchPlaces(query, type);
    } catch (err) {
      const pe = toPlacesError(err, "Could not load places from Google.");

      // Non-retryable OR last attempt → throw
      if (!isRetryableStatus(pe.status) || attempt >= retries) {
        if (pe.requestId) {
          pe.message = `${pe.message} [request-id: ${pe.requestId}]`;
        }
        throw pe;
      }

      // Retry with backoff + small jitter
      const delay =
        baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 75);

      await sleep(delay);
    }
  }

  // TypeScript will know we either returned or threw, but keep a fallback:
  throw new Error("Unreachable: retries loop exited unexpectedly");
}

export async function fetchPlacePhotos(placeId: string): Promise<PlacePhoto[]> {
  if (!placeId) return [];

  const response = await privateApi.get(`/api/v1/places/${placeId}/photos`, {
    withCredentials: true,
  });

  return unwrapPlacePhotos(response.data as unknown);
}
