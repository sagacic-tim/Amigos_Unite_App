// src/types/events/EventLocationTypes.ts

// Canonical location shape (matches your backend fields as exposed by the
// EventLocationSerializer / JSON:API adapter).
export interface EventLocation {
  id: number;

  location_type: string | null;
  business_name: string;
  business_phone?: string | null;

  address?: string | null;
  floor?: string | null;
  street_number?: string | null;
  street_name?: string | null;
  room_no?: string | null;
  apartment_suite_number?: string | null;

  city_sublocality?: string | null;
  city?: string | null;
  state_province_subdivision?: string | null;
  state_province?: string | null;
  state_province_short?: string | null;
  country?: string | null;
  country_short?: string | null;
  postal_code?: string | null;
  postal_code_suffix?: string | null;
  post_box?: string | null;

  latitude?: number | null;
  longitude?: number | null;
  time_zone?: string | null;

  // Venue / services fields
  owner_name?: string | null;
  owner_phone?: string | null;
  capacity?: number | null;
  capacity_seated?: number | null;
  availability_notes?: string | null;
  has_food?: boolean;
  has_drink?: boolean;
  has_internet?: boolean;
  has_big_screen?: boolean;
  place_id?: string | null;
  services?: string[]; // if you choose to expose this from the serializer

  // Image
  location_image_url?: string | null;
  location_image_attribution?: string | null;

  created_at: string;
  updated_at: string;
}

// Shape used when creating/updating a primary event location from the frontend
// as part of the EventCreateParams.location block.
export interface EventLocationCreatePayload {
  business_name: string;
  location_type?: string;
  street_number?: string;
  street_name?: string;
  city?: string;
  state_province?: string;
  country?: string;
  postal_code?: string;
  owner_name?: string;
  owner_phone?: string;
  capacity?: number;
  availability_notes?: string;
  has_food?: boolean;
  has_drink?: boolean;
  has_internet?: boolean;
  has_big_screen?: boolean;
  place_id?: string | null;
  location_image_attribution?: string | null;
  image_url?: string | null;        // transient – used only to fetch & store
  photo_reference?: string | null;  // preferred for server-side fetch
}
