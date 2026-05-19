import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";
    const tagsParam = searchParams.get("tags");
    const tags = tagsParam ? tagsParam.split(",").map((t) => t.trim()).filter(Boolean) : [];
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") === "asc" ? "asc" : "desc";

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
      .eq("user_id", user.id);

    // Full-text search if query provided
    if (q) {
      query = query.textSearch("search_vector", q, {
        type: "websearch",
        config: "simple",
      });
    }

    // Filter by tags (overlap)
    if (tags.length > 0) {
      query = query.overlaps("tags", tags);
    }

    // Sorting validation
    const allowedSorts = ["created_at", "name", "file_size", "updated_at"];
    if (allowedSorts.includes(sort)) {
      query = query.order(sort, { ascending: order === "asc" });
    } else {
      query = query.order("created_at", { ascending: false });
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

