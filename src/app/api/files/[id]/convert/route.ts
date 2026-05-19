import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { v2 as cloudinary } from "cloudinary";
import type { FileRecord } from "@/types/file";

const imageFormats = new Set(["jpg","jpeg","png","gif","webp","avif","svg","bmp","tiff","tif","ico","psd"]);
const audioFormats = new Set(["mp3","wav","ogg","flac","aac","m4a","wma","aiff","aif"]);
const videoFormats = new Set(["mp4","webm","avi","mov","mkv","flv","wmv","m3u8"]);

function guessResourceType(format: string): "image" | "video" | "auto" {
  const f = format.toLowerCase();
  if (imageFormats.has(f)) return "image";
  if (audioFormats.has(f) || videoFormats.has(f)) return "video";
  return "auto";
}

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
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

    const body = await request.json();
    const { format } = body;

    if (!format || typeof format !== "string") {
      return NextResponse.json(
        { success: false, error: "Target format is required" },
        { status: 400 }
      );
    }

    const targetFormat = format.toLowerCase().trim();

    // Fetch source file
    const { data: sourceFile, error: sourceError } = await supabase
      .from("files")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (sourceError || !sourceFile) {
      return NextResponse.json(
        { success: false, error: "Source file not found" },
        { status: 404 }
      );
    }

    // Skip if already in target format
    if (sourceFile.cloudinary_format === targetFormat) {
      return NextResponse.json(
        { success: false, error: `File is already in ${targetFormat} format` },
        { status: 400 }
      );
    }

    // Fetch user's Cloudinary credentials
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 400 }
      );
    }

    const { cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure } = profile;

    if (!cloudinary_cloud_name || !cloudinary_api_key || !cloudinary_api_secret) {
      return NextResponse.json(
        { success: false, error: "Cloudinary credentials not configured" },
        { status: 400 }
      );
    }

    cloudinary.config({
      cloud_name: cloudinary_cloud_name,
      api_key: cloudinary_api_key,
      api_secret: cloudinary_api_secret,
      secure: cloudinary_secure ?? true,
    });

    // Fetch original file content from Cloudinary
    const sourceRes = await fetch(sourceFile.cloudinary_url);
    if (!sourceRes.ok) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch source file from Cloudinary" },
        { status: 500 }
      );
    }

    const sourceBuffer = Buffer.from(await sourceRes.arrayBuffer());

    // Re-upload with format transformation
    const convertedResult = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fyliolabs/converted",
          resource_type: guessResourceType(targetFormat),
          format: targetFormat,
          use_filename: true,
          unique_filename: true,
          tags: [`converted_from_${sourceFile.id}`],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!);
        }
      );
      stream.end(sourceBuffer);
    });

    // Build new file record
    const newFileExt = `.${targetFormat}`;
    const newBaseName = sourceFile.name.replace(/\.[^.]+$/, "");
    const newDisplayName = `${newBaseName}${newFileExt}`;

    const insertData: Record<string, unknown> = {
      name: newDisplayName,
      display_name: newDisplayName,
      description: sourceFile.description,
      folder_id: sourceFile.folder_id,
      user_id: user.id,
      file_type: sourceFile.file_type,
      file_size: convertedResult.bytes,
      mime_type: convertedResult.resource_type === "image"
        ? `image/${targetFormat === "jpg" ? "jpeg" : targetFormat}`
        : sourceFile.mime_type,
      cloudinary_url: convertedResult.secure_url,
      cloudinary_public_id: convertedResult.public_id,
      cloudinary_format: targetFormat,
      cloudinary_width: convertedResult.width ?? null,
      cloudinary_height: convertedResult.height ?? null,
      converted_from: sourceFile.id,
      is_public: false,
      tags: [...sourceFile.tags, "converted"],
    };

    const { data: newFile, error: dbError } = await supabase
      .from("files")
      .insert(insertData as Record<string, unknown>)
      .select()
      .single();

    if (dbError || !newFile) {
      // Rollback: delete the converted file from Cloudinary
      try {
        await cloudinary.uploader.destroy(convertedResult.public_id as string);
      } catch {
        // ignore cleanup failures
      }
      return NextResponse.json(
        { success: false, error: dbError?.message || "Failed to store converted file" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: newFile });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
