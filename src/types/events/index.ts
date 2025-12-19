// src/types/events/index.ts

// All the “core” event types
export type {
  Event,
  EventStatus,
  EventCreateParams,
  AmigoMinimal,
  EventRole,
  EventMembershipStatus,
} from './EventTypes';

// Related models
export type { EventLocation } from './EventLocationTypes';
export type { EventAmigoConnector } from './EventAmigoConnectorTypes';
export type { EventLocationConnector } from './EventLocationConnectorTypes';
