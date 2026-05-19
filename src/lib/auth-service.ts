import type { SupabaseClient } from "@supabase/supabase-js";
import type { LoginInput, RegisterInput } from "@/types/auth";

export async function signUp(
  supabase: SupabaseClient,
  data: RegisterInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { email, password, full_name } = data;

    const { data: { user }, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw new Error(authError.message);
    if (!user) throw new Error("Failed to create user");

    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: user.id,
        email,
        full_name,
      });

    if (profileError) {
      await supabase.auth.admin.deleteUser(user.id);
      throw new Error(profileError.message);
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      return { success: true };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return { success: false, error: message };
  }
}

export async function signIn(
  supabase: SupabaseClient,
  data: LoginInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return { success: false, error: message };
  }
}

export async function signOut(
  supabase: SupabaseClient
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return { success: false, error: message };
  }
}

