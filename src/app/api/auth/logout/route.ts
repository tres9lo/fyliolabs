import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { signOut } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { supabase, getCookiesToSet } = createSupabaseClientForAPI(request);

    const result = await signOut(supabase);

    const response = NextResponse.json(result);

    if (result.success) {
      // Clear auth cookies by setting them to expire immediately
      const cookies = getCookiesToSet();
      cookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, {
          ...options,
          expires: new Date(0),
          maxAge: 0,
        });
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Logout failed" },
      { status: 500 }
    );
  }
}
