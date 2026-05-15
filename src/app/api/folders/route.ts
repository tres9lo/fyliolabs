import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { getFolders, getFolderTree } from "@/lib/folder-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tree = searchParams.get("tree") === "true";

    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (tree) {
      const folders = await getFolderTree();
      return NextResponse.json({ success: true, data: folders });
    } else {
      const folders = await getFolders();
      return NextResponse.json({ success: true, data: folders });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch folders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const name = body.name?.trim();
    const description = body.description?.trim() || null;
    const parent_id = body.parent_id || null;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Folder name is required" },
        { status: 400 }
      );
    }

    // Validate parent ownership if provided
    if (parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from("folders")
        .select("user_id")
        .eq("id", parent_id)
        .single();

      if (parentError || !parent || parent.user_id !== user.id) {
        return NextResponse.json(
          { success: false, error: "Invalid parent folder" },
          { status: 400 }
        );
      }
    }

    // Check duplicate name in same parent level
    const { data: duplicate, error: dupError } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", name)
      .eq("parent_id", parent_id ?? "")
      .maybeSingle();

    if (duplicate) {
      return NextResponse.json(
        { success: false, error: "Folder with this name already exists" },
        { status: 400 }
      );
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        name,
        description,
        parent_id,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: folder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create folder" },
      { status: 500 }
    );
  }
}
