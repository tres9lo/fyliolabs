import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get("folder_id");
    const all = searchParams.get("all") === "true";

    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    let query = supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (folderId) {
      query = query.eq("folder_id", folderId);
    } else if (!all) {
      // Default: only root-level files (folder_id IS NULL)
      query = query.is("folder_id", null);
    }

    const { data: files, error } = await query;

    if (error) throw error;

    return NextResponse.json({ success: true, data: files });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

