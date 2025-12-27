// src/services/apiHelper.ts
import type { AxiosInstance } from "axios";
import publicApi from "./api/publicApi";
import privateApi from "./api/privateApi";

type Method = "get" | "post" | "put" | "patch" | "delete";

type JsonApiItem = {
  id: string | number;
  attributes: Record<string, unknown>;
};

type JsonApiSingle = { data: JsonApiItem };
type JsonApiCollection = { data: JsonApiItem[] };
type JsonApiPayload = JsonApiSingle | JsonApiCollection;

/**
 * Type guard to detect a minimal JSON:API-style payload.
 */
function isJsonApiPayload(value: unknown): value is JsonApiPayload {
  if (typeof value !== "object" || value === null) return false;

  const record = value as Record<string, unknown>;
  if (!("data" in record)) return false;

  const dataField = record.data;

  if (Array.isArray(dataField)) {
    // collection
    return dataField.every((item) => {
      if (typeof item !== "object" || item === null) return false;
      const obj = item as Record<string, unknown>;
      return "id" in obj && "attributes" in obj;
    });
  }

  if (typeof dataField === "object" && dataField !== null) {
    const obj = dataField as Record<string, unknown>;
    return "id" in obj && "attributes" in obj;
  }

  return false;
}

/**
 * Fire an axios request on the given client, unwrap `.data`.
 */
async function request<T, B = unknown>(
  client: AxiosInstance,
  method: Method,
  url: string,
  data?: B,
): Promise<T> {
  const resp = await client.request<unknown>({ method, url, data });
  const payload = resp.data as unknown;

  // If it’s JSON:API style (`{ data: {...} }` or `{ data: [ ... ] }`), unwrap it:
  if (isJsonApiPayload(payload)) {
    const dataField = payload.data;

    // collection
    if (Array.isArray(dataField)) {
      const mapped = dataField.map((r) => ({
        id: Number(r.id),
        ...(r.attributes as Record<string, unknown>),
      })) as unknown as T;
      return mapped;
    }

    // single resource
    const single = {
      id: Number(dataField.id),
      ...(dataField.attributes as Record<string, unknown>),
    } as unknown as T;
    return single;
  }

  // otherwise: vanilla `{ foo: ... }`
  return payload as T;
}

// ───────────── PUBLIC (no JWT/CSRF) ─────────────
export const publicGet = <T>(url: string) =>
  request<T>(publicApi, "get", url);

export const publicPost = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(publicApi, "post", url, body);

export const publicPut = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(publicApi, "put", url, body);

export const publicPatch = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(publicApi, "patch", url, body);

export const publicDel = <T>(url: string) =>
  request<T>(publicApi, "delete", url);

// ───────────── PRIVATE (JWT + CSRF) ─────────────
export const privateGet = <T>(url: string) =>
  request<T>(privateApi, "get", url);

export const privatePost = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(privateApi, "post", url, body);

export const privatePut = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(privateApi, "put", url, body);

export const privatePatch = <T, B = unknown>(url: string, body: B) =>
  request<T, B>(privateApi, "patch", url, body);

export const privateDel = <T>(url: string) =>
  request<T>(privateApi, "delete", url);

// (Optionally, re-export one of your clients as the default)
export default publicApi;
