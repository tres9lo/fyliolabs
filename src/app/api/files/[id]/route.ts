import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { v2 as cloudinary } from "cloudinary";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: file, error } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: file });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Allowed updatable fields
    const allowed = ["display_name", "description", "is_public", "tags", "folder_id"];
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    allowed.forEach((key) => {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    });

    const { data: updated, error } = await supabase
      .from("files")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get file record
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("cloudinary_public_id, cloudinary_url")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // Delete from Cloudinary
    const { data: profile } = await supabase
      .from("profiles")
      .select("cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure")
      .eq("id", user.id)
      .single();

    if (profile && profile.cloudinary_cloud_name && profile.cloudinary_api_key && profile.cloudinary_api_secret) {
      cloudinary.config({
        cloud_name: profile.cloudinary_cloud_name,
        api_key: profile.cloudinary_api_key,
        api_secret: profile.cloudinary_api_secret,
        secure: profile.cloudinary_secure ?? true,
      });

      try {
        await cloudinary.uploader.destroy(file.cloudinary_public_id);
      } catch (e) {
        // If Cloudinary delete fails, continue with DB deletion
        console.error("Cloudinary delete failed:", e);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from("files")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { deletedId: id } });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
