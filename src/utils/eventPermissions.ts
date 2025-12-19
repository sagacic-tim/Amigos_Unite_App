// src/utils/eventPermissions.ts

import type {
  AmigoMinimal,
  EventAmigoConnector,
  EventRole,
} from "@/types/events";

export function isAdmin(current?: AmigoMinimal | null) {
  return !!current?.admin;
}

export function roleOnEvent(
  current: AmigoMinimal | null | undefined,
  connectors?: EventAmigoConnector[]
): EventRole | null {
  if (!current || !connectors) return null;
  const mine = connectors.find(c => c.amigo_id === current.id);
  return mine?.role ?? null;
}

export function canManageConnectors(current: AmigoMinimal | null, connectors?: EventAmigoConnector[]) {
  if (isAdmin(current)) return true;
  const r = roleOnEvent(current, connectors);
  return r === 'lead_coordinator' || r === 'assistant_coordinator';
}

export function canManageLocations(current: AmigoMinimal | null, connectors?: EventAmigoConnector[]) {
  return canManageConnectors(current, connectors);
}

export function canManageRoles(current: AmigoMinimal | null, connectors?: EventAmigoConnector[]) {
  if (isAdmin(current)) return true;
  return roleOnEvent(current, connectors) === 'lead_coordinator';
}

export function isManager(current: AmigoMinimal | null, connectors?: EventAmigoConnector[]) {
  const r = roleOnEvent(current, connectors);
  return isAdmin(current) || r === 'lead_coordinator' || r === 'assistant_coordinator';
}

