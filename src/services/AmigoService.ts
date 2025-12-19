// src/services/AmigoService.ts
import privateApi from '@/services/api/privateApi';
import type { Amigo } from '@/types/amigos/AmigoTypes';

// Helpers mirroring AuthContext’s shape handling
function unwrapAmigosList(payload: any): Amigo[] {
  if (Array.isArray(payload)) return payload as Amigo[];
  if (Array.isArray(payload?.amigos)) return payload.amigos as Amigo[];
  if (Array.isArray(payload?.data)) return payload.data as Amigo[];
  return [];
}

function unwrapAmigo(payload: any): Amigo {
  if (payload?.amigo) return payload.amigo as Amigo;
  if (payload?.data?.amigo) return payload.data.amigo as Amigo;
  return payload as Amigo;
}

// ─── fetch all amigos ───────────────────────
export const fetchAmigos = async (): Promise<Amigo[]> => {
  const res = await privateApi.get('/api/v1/amigos', { withCredentials: true });
  return unwrapAmigosList(res.data);
};

// ─── fetch single amigo ─────────────────────
export const fetchAmigoById = async (id: number): Promise<Amigo> => {
  const res = await privateApi.get(`/api/v1/amigos/${id}`, { withCredentials: true });
  return unwrapAmigo(res.data);
};

// ─── fetch amigo details ────────────────────
export const fetchAmigoDetails = (amigoId: number) =>
  privateApi
    .get(`/api/v1/amigos/${amigoId}/amigo_detail`, { withCredentials: true })
    .then((res) => res.data);

// ─── fetch amigo locations ──────────────────
export const fetchAmigoLocations = (amigoId: number) =>
  privateApi
    .get(`/api/v1/amigos/${amigoId}/amigo_locations`, { withCredentials: true })
    .then((res) => res.data);

// ─── create/update/delete ──────────────────
export const createAmigo = (data: Partial<Amigo>) =>
  privateApi
    .post('/api/v1/amigos', { amigo: data }, { withCredentials: true })
    .then((res) => unwrapAmigo(res.data));

export const updateAmigo = (id: number, data: Partial<Amigo>) =>
  privateApi
    .put(`/api/v1/amigos/${id}`, { amigo: data }, { withCredentials: true })
    .then((res) => unwrapAmigo(res.data));

export const deleteAmigo = (id: number) =>
  privateApi
    .delete(`/api/v1/amigos/${id}`, { withCredentials: true })
    .then(() => {});
