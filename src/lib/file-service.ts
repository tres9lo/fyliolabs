import type { SupabaseClient } from "@supabase/supabase-js";
import { v2 as cloudinary } from "cloudinary";
import type { FileRecord, FileType } from "@/types/file";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  width?: number;
  height?: number;
}

export async function uploadFile(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  folderId?: string | null
): Promise<{ success: boolean; file?: FileRecord; error?: string }> {
  try {
    // Validation: size
    if (file.size > MAX_FILE_SIZE) {
      return { success: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
    }

    const fileType = detectFileType(file.type);

    // Get user's Cloudinary credentials
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure")
      .eq("id", userId)
      .single();

    if (profileError || !profile) {
      return { success: false, error: "Profile not found. Please complete your profile." };
    }

    const { cloudinary_cloud_name, cloudinary_api_key, cloudinary_api_secret, cloudinary_secure } = profile;

    if (!cloudinary_cloud_name || !cloudinary_api_key || !cloudinary_api_secret) {
      return { success: false, error: "Cloudinary credentials not configured. Go to Settings to add them." };
    }

    // Configure Cloudinary
    cloudinary.config({
      cloud_name: cloudinary_cloud_name,
      api_key: cloudinary_api_key,
      api_secret: cloudinary_api_secret,
      secure: cloudinary_secure ?? true,
    });

    // Upload to Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "fyliolabs",
          resource_type: fileType === "video" ? "video" : "auto",
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      );
      // Write file buffer
      stream.end(buffer);
    });

    // Build insert object
    const insertData = {
      name: file.name,
      display_name: file.name,
      description: null,
      folder_id: folderId || null,
      user_id: userId,
      file_type: fileType,
      file_size: file.size,
      mime_type: file.type,
      cloudinary_url: uploadResult.secure_url,
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_format: uploadResult.format,
      cloudinary_width: uploadResult.width ?? null,
      cloudinary_height: uploadResult.height ?? null,
      converted_from: null,
      is_public: false,
      tags: [],
    };

    const { data: newFile, error: dbError } = await supabase
      .from("files")
      .insert(insertData)
      .select()
      .single();

    if (dbError) {
      // Attempt cleanup
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch {
        // ignore
      }
      return { success: false, error: dbError.message };
    }

    return { success: true, file: newFile };
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return { success: false, error: message };
  }
}

export function detectFileType(mime: string): FileType {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  if (
    mime.includes("pdf") ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("powerpoint") ||
    mime.includes("text/plain")
  ) {
    return "document";
  }
  return "other";
}

