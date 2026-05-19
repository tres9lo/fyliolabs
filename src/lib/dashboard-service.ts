import type { SupabaseClient } from "@supabase/supabase-js";
import type { FileRecord } from "@/types/file";
import type { Folder } from "@/types/folder";

export async function getRecentFiles(
  supabase: SupabaseClient,
  userId: string,
  limit = 5
): Promise<FileRecord[]> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as FileRecord[];
}

export async function getRecentFolders(
  supabase: SupabaseClient,
  userId: string,
  limit = 5
): Promise<Folder[]> {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return data as Folder[];
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
