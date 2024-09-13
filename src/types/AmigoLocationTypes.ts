// src/types/AmigoLocationTypes.ts
import { Amigo } from './AmigoTypes';

export interface AmigoLocation {
  id: number;
  address: string;
  floor?: string;
  street_number?: string;
  street_name?: string;
  room_no?: string;
  apartment_suite_number?: string;
  city_sublocality?: string;
  city?: string;
  state_province_subdivision?: string;
  state_province?: string;
  state_province_short?: string;
  country?: string;
  country_short?: string;
  postal_code?: string;
  postal_code_suffix?: string;
  post_box?: string;
  latitude?: string;
  longitude?: string;
  time_zone?: string;
  created_at: string;
  updated_at: string;

  // Add this line to include the Amigo relationship
  amigo?: Amigo; // Optional if it might not always be present
}