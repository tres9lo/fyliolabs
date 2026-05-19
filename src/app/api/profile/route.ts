import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
  try {
    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Never expose API secret in GET response (only for internal use after GET)
    const safeProfile = {
      ...profile,
      cloudinary_api_secret: profile.cloudinary_api_secret ? "••••••••" : "",
    };

    return NextResponse.json({ success: true, data: safeProfile });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { supabase } = createSupabaseClientForAPI(request, true); // use service role for profile updates
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Allowed fields for profile update
    const allowed = [
      "full_name",
      "avatar_url",
      "cloudinary_cloud_name",
      "cloudinary_api_key",
      "cloudinary_api_secret",
      "cloudinary_secure",
    ];

    const updateData = Object.keys(body)
      .filter((key) => allowed.includes(key))
      .reduce<Record<string, unknown>>((acc, key) => {
        // Don't update with empty strings for sensitive fields
        if (
          body[key] === "" &&
          (key === "cloudinary_api_key" || key === "cloudinary_api_secret")
        ) {
          return acc;
        }
        acc[key] = body[key];
        return acc;
      }, {});

    // Never allow id or email changes via profile update
    delete updateData.id;
    delete updateData.email;

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Clear sensitive fields from response
    const responseData = {
      ...updated,
      cloudinary_api_secret: updated.cloudinary_api_secret ? "••••••••" : "",
    };

    return NextResponse.json({ success: true, data: responseData });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

