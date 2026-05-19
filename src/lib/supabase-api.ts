import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CookieToSet {
  name: string;
  value: string;
  options?: {
    path?: string;
    expires?: Date;
    maxAge?: number;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    sameSite?: boolean | "lax" | "strict" | "none";
  };
}

export function createSupabaseClientForAPI(
  request: NextRequest,
  useServiceRole = false
): { supabase: SupabaseClient; getCookiesToSet: () => CookieToSet[] } {
  const cookiesToSet: CookieToSet[] = [];

  const anonKey = useServiceRole
    ? process.env.SUPABASE_SERVICE_ROLE_KEY
    : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookies) {
          cookiesToSet.push(...cookies);
        },
      },
    }
  );

  return { supabase, getCookiesToSet: () => cookiesToSet };
}
