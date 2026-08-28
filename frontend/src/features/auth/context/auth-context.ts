import { createContext } from "react";
import type { Session } from "@supabase/supabase-js";

export type AuthContextValue = {
  session: Session | null;
  user: Session["user"] | null;
  isLoading: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
