import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import AdmZip from "adm-zip";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { fileIds } = await request.json();

    if (!Array.isArray(fileIds) || fileIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files selected" },
        { status: 400 }
      );
    }

    // Get files from DB
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("id, name, cloudinary_url, cloudinary_public_id, cloudinary_format, file_type")
      .in("id", fileIds)
      .eq("user_id", user.id);

    if (filesError) {
      return NextResponse.json(
        { success: false, error: filesError.message },
        { status: 400 }
      );
    }

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No files found" },
        { status: 404 }
      );
    }

    // Fetch Cloudinary credentials from profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials not configured" },
        { status: 400 }
      );
    }

    const { cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure } = profile;

    if (!cloudinary_cloud_name || !cloudinary_api_key || !cloudinary_api_secret) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials incomplete" },
        { status: 400 }
      );
    }

    // Initialize Cloudinary for fetching original files
    const cloudinary = require("cloudinary");
    cloudinary.config({
      cloud_name: cloudinary_cloud_name,
      api_key: cloudinary_api_key,
      api_secret: cloudinary_api_secret,
      secure: cloudinary_secure ?? true,
    });

    const zip = new AdmZip();

    // Download each file and add to zip
    for (const file of files as any[]) {
      try {
        // Fetch file from Cloudinary URL
        const response = await fetch(file.cloudinary_url);
        if (!response.ok) {
          console.warn(`Failed to fetch ${file.name}: ${response.statusText}`);
          continue;
        }
        const buffer = await response.arrayBuffer();
        const nodeBuffer = Buffer.from(buffer);
        // Add to zip with original filename
        zip.addFile(file.name, nodeBuffer);
      } catch (err: any) {
        console.error(`Error adding ${file.name} to zip:`, err);
        continue;
      }
    }

    const zipBuffer = zip.toBuffer();

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="fyliolabs_${user.id}_${Date.now()}.zip"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "ZIP creation failed" },
      { status: 500 }
    );
  }
}
