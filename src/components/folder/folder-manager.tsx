"use client";

import { useState, useCallback } from "react";
import { FolderTree } from "./folder-tree";
import { FolderGrid } from "./folder-grid";
import { NewFolderModal } from "./new-folder-modal";
import { EditFolderModal } from "./edit-folder-modal";
import { DeleteFolderModal } from "./delete-folder-modal";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, FolderOpen, Search, X, LayoutGrid, List } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import type { Folder } from "@/types/folder";
import { cn } from "@/lib/utils";

interface FolderManagerProps {
  initialFolders: Folder[];
}

export function FolderManager({ initialFolders }: FolderManagerProps) {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const t = useTranslations();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass p-4 rounded-2xl shadow-sm border-[var(--border)]">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search.searchPlaceholder")}
              className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-[var(--border)] bg-white/50 dark:bg-black/20 placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center p-1 bg-[var(--surface-muted)] rounded-lg">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "grid" ? "bg-white dark:bg-gray-800 shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300")}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded-md transition-colors", viewMode === "list" ? "bg-white dark:bg-gray-800 shadow-sm text-primary-600" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300")}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <Button 
          onClick={() => setCreateOpen(true)} 
          icon={<Plus className="h-4 w-4" />}
          className="bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 transition-all border-none"
        >
          {t("common.newFolder")}
        </Button>
      </div>

      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 glass rounded-3xl border-dashed border-2 border-[var(--border)]">
            <div className="p-5 bg-primary-50 dark:bg-primary-900/20 rounded-full mb-4">
              <FolderOpen className="h-10 w-10 text-primary-400" />
            </div>
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {search ? t("search.noResults") : t("folders.noFolders")}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Get started by creating a new folder to organize your files.
            </p>
            {!search && (
              <Button onClick={() => setCreateOpen(true)} className="mt-6 shadow-sm" variant="secondary">
                Create Folder
              </Button>
            )}
          </div>
        ) : (
          viewMode === "grid" ? (
            <FolderGrid 
              folders={filtered}
              onRename={(folder) => { setSelectedFolder(folder); setEditOpen(true); }}
              onDelete={(folder) => { setSelectedFolder(folder); setDeleteOpen(true); }}
            />
          ) : (
            <div className="glass rounded-2xl border-[var(--border)] overflow-hidden shadow-sm p-2">
              <FolderTree
                folders={filtered}
                onRename={(folder) => { setSelectedFolder(folder); setEditOpen(true); }}
                onDelete={(folder) => { setSelectedFolder(folder); setDeleteOpen(true); }}
              />
            </div>
          )
        )}
      </div>

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
