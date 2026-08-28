import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { getDataSource } from "../../../lib/data-source";
import { getSupabaseClient } from "../../../lib/supabase/client";
import { AuthContext, type AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const isSupabaseEnabled = getDataSource() === "supabase";
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      setSession(null);
      setIsLoading(false);
      return;
    }

    const client = getSupabaseClient();
    let isActive = true;
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) return;
      setSession(nextSession);
      setIsLoading(false);
    });

    void client.auth.getSession().then(({ data }) => {
      if (!isActive) return;
      setSession(data.session);
      setIsLoading(false);
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [isSupabaseEnabled]);

  const value = useMemo<AuthContextValue>(() => ({ session, user: session?.user ?? null, isLoading }), [isLoading, session]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
