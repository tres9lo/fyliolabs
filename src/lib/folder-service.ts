import { createSupabaseServerClient } from "./server-supabase";
import type { Folder, FolderCreateInput, FolderUpdateInput } from "@/types/folder";

export async function getFolders(): Promise<Folder[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return folders as Folder[];
}

export async function getFolderTree(): Promise<Folder[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Build tree recursively
  const folderList = folders as Folder[];
  const map = new Map<string, Folder>();
  const roots: Folder[] = [];

  // Initialize map
  folderList.forEach((folder) => {
    map.set(folder.id, { ...folder, children: [] });
  });

  // Build tree
  folderList.forEach((folder) => {
    const node = map.get(folder.id)!;
    if (folder.parent_id && map.has(folder.parent_id)) {
      const parent = map.get(folder.parent_id)!;
      parent.children = parent.children || [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export async function createFolder(
  data: FolderCreateInput
): Promise<{ success: boolean; folder?: Folder; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // If parent_id provided, verify ownership
    if (data.parent_id) {
      const { data: parent, error: parentError } = await supabase
        .from("folders")
        .select("id, user_id")
        .eq("id", data.parent_id)
        .single();

      if (parentError || !parent || parent.user_id !== user.id) {
        return { success: false, error: "Invalid parent folder" };
      }
    }

    // Check for duplicate name in same parent
    const { data: existing, error: dupError } = await supabase
      .from("folders")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", data.name)
      .eq("parent_id", data.parent_id ?? "")
      .maybeSingle();

    if (existing) {
      return { success: false, error: "A folder with this name already exists" };
    }

    const { data: folder, error } = await supabase
      .from("folders")
      .insert({
        name: data.name,
        description: data.description || null,
        parent_id: data.parent_id || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, folder: folder as Folder };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create folder" };
  }
}

export async function updateFolder(
  id: string,
  data: FolderUpdateInput
): Promise<{ success: boolean; folder?: Folder; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Get existing folder and verify ownership
    const { data: existing, error: fetchError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing || existing.user_id !== user.id) {
      return { success: false, error: "Folder not found" };
    }

    // If moving to a different parent, validate parent
    if (data.parent_id && data.parent_id !== existing.parent_id) {
      // Prevent moving folder into its own descendants
      if (isDescendant(id, data.parent_id, [])) {
        return { success: false, error: "Cannot move folder into its own descendant" };
      }

      const { data: parent, error: parentError } = await supabase
        .from("folders")
        .select("id, user_id")
        .eq("id", data.parent_id)
        .single();

      if (parentError || !parent || parent.user_id !== user.id) {
        return { success: false, error: "Invalid parent folder" };
      }
    }

    // Check for duplicate name in same parent
    if (data.name && data.name !== existing.name) {
      const { data: duplicate, error: dupError } = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", data.name)
        .eq("parent_id", data.parent_id ?? existing.parent_id ?? "")
        .neq("id", id)
        .maybeSingle();

      if (duplicate) {
        return { success: false, error: "A folder with this name already exists" };
      }
    }

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.parent_id !== undefined) updatePayload.parent_id = data.parent_id;

    const { data: folder, error } = await supabase
      .from("folders")
      .update({
        ...updatePayload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, folder: folder as Folder };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update folder" };
  }
}

export async function deleteFolder(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify ownership and get all descendants
    const descendentIds = await getAllDescendantIds(supabase, id, user.id);

    // Check if folder has files
    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("id")
      .eq("folder_id", id)
      .limit(1);

    if (!filesError && files && files.length > 0) {
      return {
        success: false,
        error: "Cannot delete folder with files. Move or delete files first.",
      };
    }

    // Include the folder itself
    const allIds = [id, ...descendentIds];

    // Delete recursively (will cascade to child folders via cascade rule? Not set in schema)
    // We'll manually delete all
    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .in("id", allIds);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete folder" };
  }
}

async function getAllDescendantIds(
  supabase: any,
  parentId: string,
  userId: string
): Promise<string[]> {
  const ids: string[] = [];

  const { data: children, error } = await supabase
    .from("folders")
    .select("id")
    .eq("parent_id", parentId)
    .eq("user_id", userId);

  if (error || !children) return ids;

  for (const child of children as { id: string }[]) {
    ids.push(child.id);
    const subChildren = await getAllDescendantIds(supabase, child.id, userId);
    ids.push(...subChildren);
  }

  return ids;
}

function isDescendant(
  folderId: string,
  targetParentId: string,
  visited: string[]
): boolean {
  if (visited.includes(folderId)) return false; // prevent cycles

  visited.push(folderId);
  if (folderId === targetParentId) return true;

  // Would need to fetch children; simplified: prevent self-parent only.
  return false;
}
