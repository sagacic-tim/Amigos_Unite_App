// src/types/AmigoTypes.ts
export interface Amigo {
  id: number;
  first_name: string;
  last_name: string;
  user_name: string;
  email: string;
  secondary_email?: string;
  phone_1?: string;
  phone_2?: string;
  formatted_phone_1?: string;  // Add this line
  formatted_phone_2?: string;  // Add this line
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}