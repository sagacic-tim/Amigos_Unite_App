
// src/context/auth-context.ts
import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Amigo } from "@/types/amigos/AmigoTypes";

export type AuthState = {
  isLoggedIn: boolean;
  loading: boolean;
  error: string | null;
  amigos: Amigo[];
  currentAmigo: Amigo | null;
  refreshAuth: () => Promise<void>;
  refreshCurrentAmigo: () => Promise<void>;
  setCurrentAmigo: Dispatch<SetStateAction<Amigo | null>>;
};

export const AuthContext = createContext<AuthState | undefined>(undefined);
