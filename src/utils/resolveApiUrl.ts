
// src/utils/resolveApiUrl.ts
const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim();

export function resolveApiUrl(
  pathOrUrl: string | null | undefined,
  opts: { requireOriginForRelative?: boolean } = {}
): string | null {
  const { requireOriginForRelative = false } = opts;
  const p = (pathOrUrl ?? '').trim();
  if (!p) return null;
  if (/^https?:\/\//i.test(p)) return p;       // absolute stays absolute
  if (!API_ORIGIN) return requireOriginForRelative ? null : p; // strict vs permissive
  return `${API_ORIGIN.replace(/\/+$/, '')}${p}`; // join without double slashes
}
