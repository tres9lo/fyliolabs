import { z } from "zod";

export const uploadFileSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, "File is required"),
  folder_id: z.string().uuid().optional().nullable(),
});

export type FileType = "image" | "video" | "audio" | "document" | "other";

export type FileRecord = {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  folder_id: string | null;
  user_id: string;
  file_type: FileType;
  file_size: number;
  mime_type: string;
  cloudinary_url: string;
  cloudinary_public_id: string;
  cloudinary_format: string;
  cloudinary_width: number | null;
  cloudinary_height: number | null;
  converted_from: string | null;
  is_public: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
};

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
