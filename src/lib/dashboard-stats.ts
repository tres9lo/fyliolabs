import type { SupabaseClient } from "@supabase/supabase-js";

export async function getDashboardStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  totalFiles: number;
  totalFolders: number;
  storageUsed: string;
  fileTypeBreakdown: { type: string; label: string; bytes: number }[];
}> {
  const [fileResult, folderResult, sizeRowsResult] = await Promise.all([
    supabase.from("files").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("folders").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("files").select("file_size, file_type").eq("user_id", userId),
  ]);

  const totalFiles = fileResult.count || 0;
  const totalFolders = folderResult.count || 0;

  // Compute file type breakdown
  const typeMap = new Map<string, number>();
  let totalBytes = 0;
  if (sizeRowsResult.data) {
    for (const row of sizeRowsResult.data as { file_size: number; file_type: string }[]) {
      totalBytes += row.file_size;
      typeMap.set(row.file_type, (typeMap.get(row.file_type) || 0) + row.file_size);
    }
  }
  const fileTypeBreakdown = [
    { type: "image", label: "Images", bytes: typeMap.get("image") || 0 },
    { type: "video", label: "Videos", bytes: typeMap.get("video") || 0 },
    { type: "audio", label: "Audio", bytes: typeMap.get("audio") || 0 },
    { type: "document", label: "Documents", bytes: typeMap.get("document") || 0 },
    { type: "other", label: "Other", bytes: typeMap.get("other") || 0 },
  ].filter((entry) => entry.bytes > 0);

  const gb = totalBytes / 1024 / 1024 / 1024;
  const storageUsed =
    gb >= 1
      ? `${gb.toFixed(2)} GB`
      : `${((totalBytes / 1024 / 1024) || 0).toFixed(2)} MB`;

  return {
    totalFiles,
    totalFolders,
    storageUsed,
    fileTypeBreakdown,
  };
}
