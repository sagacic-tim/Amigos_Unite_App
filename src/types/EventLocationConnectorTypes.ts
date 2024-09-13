// src/types/EventLocationConnectorTypes.ts

export interface EventLocationConnector {
  id: number;
  event_id: number;
  event_name: string;
  event_date: string;
  event_time: string;
  event_location_id: number;
  business_name: string;
  business_address: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  latitude: number;
  longitude: number;
}