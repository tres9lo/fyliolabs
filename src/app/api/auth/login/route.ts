import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { signIn } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { supabase, getCookiesToSet } = createSupabaseClientForAPI(request);

    const result = await signIn(supabase, { email, password });

    const response = NextResponse.json(result);

    if (result.success) {
      const cookies = getCookiesToSet();
      cookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}
