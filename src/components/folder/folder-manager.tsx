"use client";

import { useState, useCallback } from "react";
import { FolderTree } from "./folder-tree";
import { NewFolderModal } from "./new-folder-modal";
import { EditFolderModal } from "./edit-folder-modal";
import { DeleteFolderModal } from "./delete-folder-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2, FolderOpen, Search, X } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import type { Folder } from "@/types/folder";

interface FolderManagerProps {
  initialFolders: Folder[];
}

export function FolderManager({ initialFolders }: FolderManagerProps) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const t = useTranslations();
  const [search, setSearch] = useState("");

  // ── modal states ──
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/folders?tree=true");
      const json = await res.json();
      if (json.success) setFolders(json.data as Folder[]);
    } catch (error) {
      console.error("Failed to refresh folders:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreate = async (data: { name: string; description?: string; parent_id?: string | null }) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed to create folder");
    setCreateOpen(false);
    void refresh();
    addToast({ title: t("toast.success"), description: "Folder created", variant: "success" });
  };

  const handleUpdate = async (id: string, data: { name: string; description: string | null }) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed to update folder");
    setEditOpen(false);
    setSelectedFolder(null);
    void refresh();
    addToast({ title: t("toast.success"), description: "Folder updated", variant: "success" });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed to delete folder");
    setDeleteOpen(false);
    setSelectedFolder(null);
    void refresh();
    addToast({ title: t("toast.success"), description: "Folder deleted", variant: "success" });
  };

  // Filter by search
  const filtered = filterFolders(folders, search);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("folders.yourFolders")}</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{folders.length} folder{folders.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} icon={<Plus className="h-4 w-4" />}>
          {t("common.newFolder")}
        </Button>
      </div>

      <Card className="p-5 border-[var(--border)] shadow-sm bg-[var(--surface)]">
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("search.searchPlaceholder")}
            className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-[var(--surface)]"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="p-4 bg-[var(--surface-muted)] rounded-2xl mb-3">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {search ? t("search.noResults") : t("folders.noFolders")}
            </p>
          </div>
        ) : (
          <FolderTree
            folders={filtered}
            onRename={(folder) => {
              setSelectedFolder(folder);
              setEditOpen(true);
            }}
            onDelete={(folder) => {
              setSelectedFolder(folder);
              setDeleteOpen(true);
            }}
          />
        )}
      </Card>

      {/* Modals */}
      <NewFolderModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreate}
      />

      {selectedFolder && (
        <>
          <EditFolderModal
            isOpen={editOpen}
            onClose={() => { setEditOpen(false); setSelectedFolder(null); }}
            folder={selectedFolder}
            onUpdate={handleUpdate}
          />
          <DeleteFolderModal
            isOpen={deleteOpen}
            onClose={() => { setDeleteOpen(false); setSelectedFolder(null); }}
            folder={selectedFolder}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}

function filterFolders(folders: Folder[], search: string): Folder[] {
  if (!search.trim()) return folders;
  const q = search.toLowerCase();
  const result: Folder[] = [];
  function walk(items: Folder[]) {
    for (const f of items) {
      if (f.name.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q)) {
        result.push(f);
      }
      if (f.children?.length) walk(f.children);
    }
  }
  walk(folders);
  return result;
}
