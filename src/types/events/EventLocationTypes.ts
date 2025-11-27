
// Canonical location shape (matches your backend fields)
export interface EventLocation {
  id: number;
  business_name: string;
  business_phone?: string;
  address?: string;
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
  latitude?: number;
  longitude?: number;
  time_zone?: string;
  created_at: string;
  updated_at: string;
  location_image_url?: string | null;
  location_image_attribution?: string | null;
}
