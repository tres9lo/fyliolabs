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

    // 1. Files Query
    let filesQuery = supabase
      .from("files")
      .select("*")
      .eq("user_id", user.id);

    if (q) {
      // Partial matching for files
      filesQuery = filesQuery.or(`display_name.ilike.%${q}%,name.ilike.%${q}%`);
    }

    if (tags.length > 0) {
      filesQuery = filesQuery.overlaps("tags", tags);
    }

    // Sorting validation
    const allowedSorts = ["created_at", "name", "file_size", "updated_at"];
    if (allowedSorts.includes(sort)) {
      filesQuery = filesQuery.order(sort, { ascending: order === "asc" });
    } else {
      filesQuery = filesQuery.order("created_at", { ascending: false });
    }

    // 2. Folders Query (No tags for folders usually, so just search name)
    let foldersQuery = supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id);

    if (q) {
      // Partial matching for folders
      foldersQuery = foldersQuery.ilike("name", `%${q}%`);
    }

    const folderSorts = ["created_at", "name", "updated_at"];
    if (folderSorts.includes(sort)) {
      foldersQuery = foldersQuery.order(sort, { ascending: order === "asc" });
    } else {
      foldersQuery = foldersQuery.order("created_at", { ascending: false });
    }

    // Execute both in parallel
    const [filesResult, foldersResult] = await Promise.all([
      filesQuery,
      foldersQuery
    ]);

    if (filesResult.error) throw filesResult.error;
    if (foldersResult.error) throw foldersResult.error;

    return NextResponse.json({ 
      success: true, 
      data: { 
        files: filesResult.data, 
        folders: foldersResult.data 
      } 
    });
  } catch (error: unknown) {
    const message = (error instanceof Error) ? error.message : "Unexpected error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

