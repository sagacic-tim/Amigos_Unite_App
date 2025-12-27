// src/services/AmigoService.ts
import privateApi from "@/services/api/privateApi";
import type { Amigo } from "@/types/amigos/AmigoTypes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers mirroring AuthContext’s shape handling
// Accepts several possible payload shapes, but with precise typing.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unwrap a list of amigos from various payload shapes:
 * - Amigo[]
 * - { amigos: Amigo[] }
 * - { data: Amigo[] }
 */
function unwrapAmigosList(payload: unknown): Amigo[] {
  // Bare array
  if (Array.isArray(payload)) {
    return payload as Amigo[];
  }

  if (typeof payload === "object" && payload !== null) {
    const obj = payload as {
      amigos?: unknown;
      data?: unknown;
    };

    if (Array.isArray(obj.amigos)) {
      return obj.amigos as Amigo[];
    }

    if (Array.isArray(obj.data)) {
      return obj.data as Amigo[];
    }
  }

  return [];
}

/**
 * Unwrap a single amigo from various payload shapes:
 * - Amigo
 * - { amigo: Amigo }
 * - { data: { amigo: Amigo } }
 */
function unwrapAmigo(payload: unknown): Amigo {
  if (typeof payload === "object" && payload !== null) {
    const obj = payload as {
      amigo?: Amigo;
      data?: { amigo?: Amigo };
    };

    if (obj.amigo) {
      return obj.amigo;
    }

    if (obj.data?.amigo) {
      return obj.data.amigo;
    }
  }

  // Fallback: assume the payload itself is already an Amigo shape
  return payload as Amigo;
}

// ─── fetch all amigos ───────────────────────
export const fetchAmigos = async (): Promise<Amigo[]> => {
  const res = await privateApi.get("/api/v1/amigos", {
    withCredentials: true,
  });
  return unwrapAmigosList(res.data);
};

// ─── fetch single amigo ─────────────────────
export const fetchAmigoById = async (id: number): Promise<Amigo> => {
  const res = await privateApi.get(`/api/v1/amigos/${id}`, {
    withCredentials: true,
  });
  return unwrapAmigo(res.data);
};

// ─── fetch amigo details ────────────────────
export const fetchAmigoDetails = (amigoId: number) =>
  privateApi
    .get(`/api/v1/amigos/${amigoId}/amigo_detail`, {
      withCredentials: true,
    })
    .then((res) => res.data);

// ─── fetch amigo locations ──────────────────
export const fetchAmigoLocations = (amigoId: number) =>
  privateApi
    .get(`/api/v1/amigos/${amigoId}/amigo_locations`, {
      withCredentials: true,
    })
    .then((res) => res.data);

// ─── create/update/delete ──────────────────
export const createAmigo = (data: Partial<Amigo>) =>
  privateApi
    .post(
      "/api/v1/amigos",
      { amigo: data },
      { withCredentials: true },
    )
    .then((res) => unwrapAmigo(res.data));

export const updateAmigo = (id: number, data: Partial<Amigo>) =>
  privateApi
    .put(
      `/api/v1/amigos/${id}`,
      { amigo: data },
      { withCredentials: true },
    )
    .then((res) => unwrapAmigo(res.data));

export const deleteAmigo = (id: number) =>
  privateApi
    .delete(`/api/v1/amigos/${id}`, { withCredentials: true })
    .then(() => {});
