import { createSupabaseServerClient } from "./server-supabase";
import type { Profile } from "@/types/profile";

export async function getServerProfile(): Promise<Profile | null> {
  return getCurrentProfile();
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile as Profile;
}

export async function updateProfile(
  data: Record<string, unknown>
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, profile: updated as Profile };
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return { success: false, error: message };
  }
}

