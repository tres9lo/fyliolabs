"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
});

type SupabaseProviderProps = {
  children: React.ReactNode;
  initialSession: Session | null;
};

export function SupabaseProvider({
  children,
  initialSession,
}: SupabaseProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [user, setUser] = useState<User | null>(initialSession?.user ?? null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial session already set, no need to fetch
    setLoading(false);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // If there's an initial session, make sure Supabase client knows
    if (initialSession) {
      supabase.auth.setSession(initialSession);
    }

    return () => subscription.unsubscribe();
  }, [initialSession]);

  const value = useMemo(
    () => ({ session, user, loading }),
    [session, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
