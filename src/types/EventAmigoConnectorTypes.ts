// src/types/EventAmigoConnectorTypes.ts

import { Amigo } from './AmigoTypes';

export interface EventAmigoConnector {
  id: number;
  event_id: number;
  amigo_id: number;
  role: string;
  amigo: Amigo;
  created_at: string;
  updated_at: string;
}