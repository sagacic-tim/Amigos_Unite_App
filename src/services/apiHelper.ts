// src/services/apiHelper.ts
import type { AxiosInstance } from 'axios';
import publicApi from './publicApi';
import privateApi from './privateApi';

type Method = 'get' | 'post' | 'put' | 'patch' | 'delete';

/**
 * Fire an axios request on the given client, unwrap `.data`.
 */
async function request<T>(
  client: AxiosInstance,
  method: Method,
  url: string,
  data?: any
): Promise<T> {
  const resp = await client.request<any>({ method, url, data });
  const payload = resp.data;

  // If it’s JSON:API style (`{ data: {...} }` or `{ data: [ ... ] }`), unwrap it:
  if (payload.data != null) {
    // collection
    if (Array.isArray(payload.data)) {
      return payload.data.map((r: any) => ({
        id: Number(r.id),
        ...r.attributes,
      })) as any;
    }
    // single resource
    return {
      id: Number(payload.data.id),
      ...payload.data.attributes,
    } as any;
  }

  // otherwise: vanilla `{ foo: ... }`
  return payload;
}

// ───────────── PUBLIC (no JWT/CSRF) ─────────────
export const publicGet   = <T>(url: string)         => request<T>(publicApi,  'get',    url);
export const publicPost  = <T>(url: string, body: any) => request<T>(publicApi,  'post',   url, body);
export const publicPut   = <T>(url: string, body: any) => request<T>(publicApi,  'put',    url, body);
export const publicPatch = <T>(url: string, body: any) => request<T>(publicApi,  'patch',  url, body);
export const publicDel   = <T>(url: string)         => request<T>(publicApi,  'delete', url);

// ───────────── PRIVATE (JWT + CSRF) ─────────────
export const privateGet   = <T>(url: string)         => request<T>(privateApi, 'get',    url);
export const privatePost  = <T>(url: string, body: any) => request<T>(privateApi, 'post',   url, body);
export const privatePut   = <T>(url: string, body: any) => request<T>(privateApi, 'put',    url, body);
export const privatePatch = <T>(url: string, body: any) => request<T>(privateApi, 'patch',  url, body);
export const privateDel   = <T>(url: string)         => request<T>(privateApi, 'delete', url);

// (Optionally, re‑export one of your clients as the default)
export default publicApi;
