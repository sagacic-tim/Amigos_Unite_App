// src/types/AmigoDetailTypes.ts
import { Amigo } from './AmigoTypes';
import { AmigoLocation } from './AmigoLocationTypes';

export interface AmigoDetails {
  id: number;
  amigo_id: number;
  date_of_birth: string;
  member_in_good_standing: boolean;
  available_to_host: boolean;
  willing_to_help: boolean;
  willing_to_donate: boolean;
  personal_bio: string;
  amigo: Amigo;
  locations: AmigoLocation[]; // Add this line
}
