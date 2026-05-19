import { createSupabaseServerClient } from "./server-supabase";
import type { Folder, FolderCreateInput, FolderUpdateInput } from "@/types/folder";

function withSupabase<T>(fn: (supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) => Promise<T>): Promise<T> {
  return (async () => {
    const supabase = await createSupabaseServerClient();
    return fn(supabase);
  })();
}

// ─── reads ───────────────────────────────────────────────────────

export async function getFolders(): Promise<Folder[]> {
  return withSupabase(async (supabase) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: folders, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) return [];
    return (folders ?? []) as Folder[];
  });
}

export async function getFolderTree(): Promise<Folder[]> {
  return withSupabase(async (supabase) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: folders, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) return [];

    const folderList = (folders ?? []) as Folder[];
    const map = new Map<string, Folder & { children: Folder[] }>();
    const roots: Folder[] = [];

    folderList.forEach((folder) => {
      map.set(folder.id, { ...folder, children: [] });
    });

    folderList.forEach((folder) => {
      const node = map.get(folder.id)!;
      if (folder.parent_id && map.has(folder.parent_id)) {
        const parent = map.get(folder.parent_id)!;
        parent.children = parent.children ?? [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  });
}

// ─── writes ──────────────────────────────────────────────────────

export async function createFolder(
  data: FolderCreateInput
): Promise<{ success: boolean; folder?: Folder; error?: string }> {
  return withSupabase(async (supabase) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Unauthorized" };

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

    // Duplicate check — avoid chained `maybeSingle()` on ternary
    let maybeExisting: { data: Folder | null } | null = null;
    if (data.parent_id) {
      maybeExisting = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", data.name)
        .eq("parent_id", data.parent_id)
        .maybeSingle();
    } else {
      maybeExisting = await supabase
        .from("folders")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", data.name)
        .is("parent_id", null)
        .maybeSingle();
    }
    if (maybeExisting?.data) {
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

    if (error) return { success: false, error: error.message };
    return { success: true, folder: folder as Folder };
  });
}

export async function updateFolder(
  id: string,
  data: FolderUpdateInput
): Promise<{ success: boolean; folder?: Folder; error?: string }> {
  return withSupabase(async (supabase) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Unauthorized" };

    const { data: existing, error: fetchError } = await supabase
      .from("folders")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return { success: false, error: "Folder not found" };
    }
    if ((existing as Folder).user_id !== user.id) {
      return { success: false, error: "Folder not found" };
    }

    // Prevent moving into own descendants
    if (data.parent_id && data.parent_id !== existing.parent_id) {
      const descendantIds = await getAllDescendantIds(supabase, id, user.id);
      if (descendantIds.includes(data.parent_id)) {
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

    // Duplicate name check
    if (data.name && data.name !== existing.name) {
      const targetParentId = data.parent_id !== undefined ? data.parent_id : existing.parent_id;
      let maybeDuplicate: { data: Folder | null } | null = null;
      if (targetParentId) {
        maybeDuplicate = await supabase
          .from("folders")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", data.name)
          .neq("id", id)
          .eq("parent_id", targetParentId)
          .maybeSingle();
      } else {
        maybeDuplicate = await supabase
          .from("folders")
          .select("id")
          .eq("user_id", user.id)
          .eq("name", data.name)
          .neq("id", id)
          .is("parent_id", null)
          .maybeSingle();
      }
      if (maybeDuplicate?.data) {
        return { success: false, error: "A folder with this name already exists" };
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.parent_id !== undefined) updatePayload.parent_id = data.parent_id;
    updatePayload.updated_at = new Date().toISOString();

    const { data: folder, error } = await supabase
      .from("folders")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return { success: true, folder: folder as Folder };
  });
}

export async function deleteFolder(
  id: string
): Promise<{ success: boolean; error?: string }> {
  return withSupabase(async (supabase) => {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { success: false, error: "Unauthorized" };

    const descendantIds = await getAllDescendantIds(supabase, id, user.id);
    const pathIds = descendantIds.length > 0 ? [id, ...descendantIds] : [id];

    const { data: files, error: filesError } = await supabase
      .from("files")
      .select("id")
      .in("folder_id", pathIds)
      .limit(1);

    if (!filesError && files && (files as unknown[]).length > 0) {
      return { success: false, error: "Cannot delete folder with files. Move or delete files first." };
    }

    const { error: deleteError } = await supabase
      .from("folders")
      .delete()
      .in("id", pathIds);

    if (deleteError) return { success: false, error: deleteError.message };
    return { success: true };
  });
}

// ─── recursive helper ────────────────────────────────────────────

async function getAllDescendantIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
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
    const sub = await getAllDescendantIds(supabase, child.id, userId);
    ids.push(...sub);
  }
  return ids;
}
