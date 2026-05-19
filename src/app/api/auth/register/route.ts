import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { signUp } from "@/lib/auth-service";

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { supabase, getCookiesToSet } = createSupabaseClientForAPI(
      request,
      true // use service role for admin operations
    );

    const result = await signUp(supabase, { email, password, full_name });

    const response = NextResponse.json(result);

    if (result.success) {
      const cookies = getCookiesToSet();
      cookies.forEach(({ name, value, options }) => {
        response.cookies.set(name, value, options);
      });
    }

    return response;
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

