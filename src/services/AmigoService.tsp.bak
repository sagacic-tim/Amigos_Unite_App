// src/services/AmigoService.ts
import {
  privateGet,
  privatePost,
  privatePut,
  // privatePatch,
  privateDel
} from './apiHelper';
import { Amigo } from '../types/AmigoTypes';

// ─── fetch all amigos ───────────────────────
export const fetchAmigos = (): Promise<Amigo[]> =>
  privateGet<Amigo[]>('/api/v1/amigos');

// ─── fetch single amigo ─────────────────────
export const fetchAmigoById = (id: number): Promise<Amigo> =>
  privateGet<Amigo>(`/api/v1/amigos/${id}`);

// ─── fetch amigo details ────────────────────
export const fetchAmigoDetails = (amigoId: number) =>
  privateGet<any>(`/api/v1/amigos/${amigoId}/amigo_detail`);

// ─── fetch amigo locations ──────────────────
export const fetchAmigoLocations = (amigoId: number) =>
  privateGet<any>(`/api/v1/amigos/${amigoId}/amigo_locations`);

// ─── create/update/delete ──────────────────
export const createAmigo = (data: Partial<Amigo>) =>
  privatePost<Amigo>('/api/v1/amigos', data);

export const updateAmigo = (id: number, data: Partial<Amigo>) =>
  privatePut<Amigo>(`/api/v1/amigos/${id}`, data);

export const deleteAmigo = (id: number) =>
  privateDel<void>(`/api/v1/amigos/${id}`);
