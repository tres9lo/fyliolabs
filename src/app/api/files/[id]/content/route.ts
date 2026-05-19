import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { v2 as cloudinary } from "cloudinary";

interface RouteParams {
  params: Promise<{ id: string }>;
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

    const { content } = await request.json();
    if (content === undefined) {
      return NextResponse.json(
        { success: false, error: "Content is required" },
        { status: 400 }
      );
    }

    // 1. Get existing file record to fetch Cloudinary config & original public ID
    const { data: file, error: fetchError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !file) {
      return NextResponse.json(
        { success: false, error: "File not found" },
        { status: 404 }
      );
    }

    // 2. Fetch User's Cloudinary Credentials
    const { data: profile } = await supabase
      .from("profiles")
      .select("cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.cloudinary_cloud_name || !profile.cloudinary_api_key || !profile.cloudinary_api_secret) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials not configured." },
        { status: 400 }
      );
    }

    // 3. Configure Cloudinary
    cloudinary.config({
      cloud_name: profile.cloudinary_cloud_name,
      api_key: profile.cloudinary_api_key,
      api_secret: profile.cloudinary_api_secret,
      secure: profile.cloudinary_secure ?? true,
    });

    // 4. Overwrite file in Cloudinary using upload_stream (resource_type: raw for text content)
    const buffer = Buffer.from(content, "utf-8");
    const byteLength = buffer.byteLength;

    const uploadResult = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          public_id: file.cloudinary_public_id,
          resource_type: "raw",
          overwrite: true,
          invalidate: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    // 5. Update database record with new file size and update timestamp
    const { data: updated, error: updateError } = await supabase
      .from("files")
      .update({
        file_size: byteLength,
        cloudinary_url: uploadResult.secure_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
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
