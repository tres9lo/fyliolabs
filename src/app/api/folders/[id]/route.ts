import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForAPI } from "@/lib/supabase-api";
import { deleteFolder, updateFolder } from "@/lib/folder-service";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !folder) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: folder });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch folder" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updates: any = {};

    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.parent_id !== undefined) updates.parent_id = body.parent_id;

    updates.updated_at = new Date().toISOString();

    // Check for duplicate name in same parent
    if (body.name) {
      const { data: existing } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", body.name)
        .eq("parent_id", body.parent_id ?? (await getParentId(supabase, id)))
        .neq("id", id)
        .maybeSingle();

      if (existing) {
        return NextResponse.json(
          { success: false, error: "A folder with this name already exists" },
          { status: 400 }
        );
      }
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id)
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
      { success: false, error: error.message || "Failed to update folder" },
      { status: 500 }
    );
  }
}

async function getParentId(
  supabase: any,
  folderId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("folders")
    .select("parent_id")
    .eq("id", folderId)
    .single();
  return data?.parent_id ?? null;
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    const { supabase } = createSupabaseClientForAPI(request, true);
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("folders")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: "Folder not found" },
        { status: 404 }
      );
    }

    // Check if folder contains files
    const { data: files } = await supabase
      .from("files")
      .select("id")
      .eq("folder_id", id)
      .limit(1);

    if (files && files.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete folder with files. Remove files first." },
        { status: 400 }
      );
    }

    // Get all descendant folders recursively
    const descendantIds = await getAllDescendantIds(supabase, id, user.id);
    const allIds = [id, ...descendantIds];

    // Delete all (descendants)
    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .in("id", allIds);

    if (deleteError) {
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { deletedIds: allIds } });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete folder" },
      { status: 500 }
    );
  }
}

async function getAllDescendantIds(
  supabase: any,
  parentId: string,
  userId: string
): Promise<string[]> {
  const ids: string[] = [];

  const { data: children } = await supabase
    .from("folders")
    .select("id")
    .eq("parent_id", parentId)
    .eq("user_id", userId);

  if (!children) return ids;

  for (const child of children as { id: string }[]) {
    ids.push(child.id);
    const sub = await getAllDescendantIds(supabase, child.id, userId);
    ids.push(...sub);
  }

  return ids;
}
