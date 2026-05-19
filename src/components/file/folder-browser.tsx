"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import type { Folder } from "@/types/folder";
import type { FileRecord } from "@/types/file";
import { cn } from "@/lib/utils";
import {
  FolderPlus, Loader2, Home, ChevronDown, ChevronRight,
  MoreHorizontal, Edit3, Trash2, FolderOpen, Archive
} from "lucide-react";
import { toast } from "sonner";
import { NewFolderModal } from "@/components/folder/new-folder-modal";
import { EditFolderModal } from "@/components/folder/edit-folder-modal";
import { DeleteFolderModal } from "@/components/folder/delete-folder-modal";
import { formatDate } from "@/lib/utils";

/* ── Client-side API helpers (no server-supabase import) ── */

async function fetchFolderTree(): Promise<Folder[]> {
  const res = await fetch("/api/folders?tree=true");
  const json = await res.json();
  return json.success ? (json.data as Folder[]) : [];
}

async function fetchFoldersFlat(): Promise<Folder[]> {
  const res = await fetch("/api/folders");
  const json = await res.json();
  return json.success ? (json.data as Folder[]) : [];
}

interface FolderBrowserProps {
  files: FileRecord[];
  loading: boolean;
  currentFolderId: string | null;
  onFolderSelect: (folderId: string | null) => void;
  onFilesChange: () => void;
  onMoveFile: (fileId: string, targetFolderId: string) => void;
}

type ViewMode = "grid" | "tree";

export function FolderBrowser({
  files,
  loading,
  currentFolderId,
  onFolderSelect,
  onFilesChange,
  onMoveFile,
}: FolderBrowserProps) {
  const t = useTranslations();
  const [tree, setTree] = useState<Folder[]>([]);
  const [flatLoading, setFlatLoading] = useState(true);
  const [dragOverFolder, setDragOverFolder] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const loadFolders = useCallback(async () => {
    setFlatLoading(true);
    try {
      const [treeRes, _flatRes] = await Promise.all([
        fetchFolderTree(),
        fetchFoldersFlat(), // reserved for future use
      ]);
      setTree(treeRes);
      const allIds = new Set<string>();
      const collect = (items: Folder[]) => {
        for (const f of items) { allIds.add(f.id); if (f.children) collect(f.children); }
      };
      collect(treeRes);
      setExpandedIds(allIds);
    } catch (err) {
      console.error(err);
    } finally {
      setFlatLoading(false);
    }
   }, []);

  useEffect(() => { void loadFolders(); }, [loadFolders]);

  // ── Count files in folder ──
  const fileCounts: Record<string, number> = {};
  function countFiles(folderList: FileRecord[]) {
    for (const f of folderList) {
      if (f.folder_id) fileCounts[f.folder_id] = (fileCounts[f.folder_id] || 0) + 1;
    }
  }
  countFiles(files);

  // ── Handlers ──
  const handleCreate = async (data: { name: string; description?: string; parent_id?: string | null }) => {
    const res = await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    void loadFolders();
    onFilesChange();
    toast.success(t("toast.success"), { description: "Folder created" });
    setCreateOpen(false);
  };

  const handleUpdate = async (id: string, data: { name: string; description: string | null }) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    void loadFolders();
    toast.success(t("toast.success"), { description: "Folder updated" });
    setEditOpen(false);
    setSelectedFolder(null);
    setRenamingId(null);
    setRenameValue("");
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.error || "Failed");
    if (currentFolderId === id) onFolderSelect(null);
    void loadFolders();
    onFilesChange();
    toast.success(t("toast.success"), { description: "Folder deleted" });
    setDeleteOpen(false);
    setSelectedFolder(null);
  };

  const handleRenameSubmit = (folder: Folder) => {
    if (renameValue.trim() && renameValue !== folder.name) {
      handleUpdate(folder.id, { name: renameValue, description: folder.description });
    } else {
      setRenamingId(null);
      setRenameValue("");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDropOnFolder = (e: React.DragEvent, folderId: string) => {
    e.preventDefault(); e.stopPropagation();
    setDragOverFolder(null);
    const fileId = e.dataTransfer.getData("text/plain");
    if (fileId && fileId !== folderId) onMoveFile(fileId, folderId);
  };

  const countDescendants = (folder: Folder & { children?: Folder[] }): number => {
    if (!folder.children?.length) return 0;
    return folder.children.reduce((acc: number, child: Folder) => acc + 1 + countDescendants(child as Folder & { children?: Folder[] }), 0);
  };

  // ── Render: Flat grid of folder cards ──
  const renderFolderGrid = (items: Folder[], depth = 0) => (
    <div className="grid gap-2.5 grid-cols-1" key={depth}>
      {items.map((folder) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = expandedIds.has(folder.id);
        const isCurrent = currentFolderId === folder.id;
        const isDragOver = dragOverFolder === folder.id;
        const count = fileCounts[folder.id] || 0;
        const descendantCount = hasChildren ? countDescendants(folder as Folder & { children?: Folder[] }) : 0;
        const openMenu = openMenuId === folder.id;

        return (
          <div key={folder.id}>
            <div
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", folder.id); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
              onDragLeave={() => { if (dragOverFolder === folder.id) setDragOverFolder(null); }}
              onDrop={(e) => handleDropOnFolder(e, folder.id)}
              className={cn(
                "group relative rounded-xl border bg-[var(--surface)] transition-all duration-150",
                "hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer",
                isCurrent
                  ? "ring-2 ring-primary-500 border-primary-500 shadow-md"
                  : isDragOver
                    ? "ring-2 ring-primary-400 ring-offset-1 border-primary-400 bg-primary-50/50 dark:bg-primary-900/30"
                    : "border-[var(--border)]",
                depth === 0 ? "p-3.5" : "ml-4 p-2.5"
              )}
              onClick={() => onFolderSelect(folder.id)}
            >
              <div className="flex items-center gap-2.5">
                {/* Visual folder icon */}
                <div className={cn(
                  "flex-shrink-0 rounded-lg flex items-center justify-center",
                  depth === 0 ? "w-10 h-10" : "w-8 h-8",
                  isCurrent
                    ? "bg-primary-100 dark:bg-primary-900/50"
                    : "bg-blue-50 dark:bg-blue-900/25"
                )}>
                  <Archive className={cn(
                    depth === 0 ? "h-5 w-5" : "h-4 w-4",
                    isCurrent
                      ? "text-primary-600 dark:text-primary-400"
                      : "text-blue-500 dark:text-blue-400"
                  )} />
                </div>

                {renamingId === folder.id ? (
                  <input
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(folder)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRenameSubmit(folder);
                      if (e.key === "Escape") setRenamingId(null);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 min-w-0 bg-white dark:bg-gray-800 border border-primary-400 rounded px-2 py-1 text-xs focus:outline-none"
                  />
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "font-medium break-words whitespace-normal",
                        depth === 0
                          ? "text-sm text-gray-900 dark:text-white"
                          : "text-xs text-gray-700 dark:text-gray-300",
                        isCurrent && "text-primary-700 dark:text-primary-400"
                      )}>
                        {folder.name}
                      </p>
                      {depth === 0 && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                          {count > 0 ? `${count} file${count !== 1 ? "s" : ""}` : "Empty"}
                          {descendantCount > 0 ? ` · ${descendantCount} sub-folders` : ""}
                        </p>
                      )}
                    </div>

                    {/* Chevron for expand/collapse */}
                    {hasChildren ? (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                      >
                        {isExpanded
                          ? <ChevronDown className="h-4 w-4 text-gray-400" />
                          : <ChevronRight className="h-4 w-4 text-gray-400" />
                        }
                      </button>
                    ) : openMenu ? (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === folder.id ? null : folder.id); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(folder.id); }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Inline rename/save */}
              {renamingId === folder.id && depth === 0 && (
                <div className="flex items-center gap-1 mt-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleRenameSubmit(folder)} className="text-[11px] px-2 py-1 rounded bg-primary-500 text-white hover:bg-primary-600">
                    Save
                  </button>
                  <button onClick={() => { setRenamingId(null); setRenameValue(""); }} className="text-[11px] px-2 py-1 rounded border border-[var(--border)]">
                    Cancel
                  </button>
                </div>
              )}

              {/* Dropdown actions */}
              {openMenu && !renamingId && (
                <div className="absolute right-2 top-10 z-20 w-36 bg-white dark:bg-gray-800 border border-[var(--border)] rounded-lg shadow-lg py-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setRenamingId(folder.id);
                      setRenameValue(folder.name);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-[var(--surface-muted)]"
                  >
                    <Edit3 className="h-3 w-3" /> Rename
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFolder(folder);
                      setDeleteOpen(true);
                      setOpenMenuId(null);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>

            {hasChildren && isExpanded && renderFolderGrid(folder.children!, depth + 1)}
          </div>
        );
      })}
    </div>
  );

  // ── Render: Folder tree sidebar view ──
  const renderTree = (items: Folder[], depth = 0) => (
    <div className={cn(depth > 0 && "ml-4")}>
      {items.map((folder) => {
        const hasChildren = folder.children && folder.children.length > 0;
        const isExpanded = expandedIds.has(folder.id);
        const isCurrent = currentFolderId === folder.id;
        const isDragOver = dragOverFolder === folder.id;

        return (
          <div key={folder.id}>
            <div
              draggable
              onDragStart={(e) => { e.dataTransfer.setData("text/plain", folder.id); }}
              onDragOver={(e) => { e.preventDefault(); setDragOverFolder(folder.id); }}
              onDragLeave={() => { if (dragOverFolder === folder.id) setDragOverFolder(null); }}
              onDrop={(e) => handleDropOnFolder(e, folder.id)}
              className={cn(
                "group flex items-center gap-2 py-1.5 px-2.5 rounded-lg cursor-pointer transition-all text-sm",
                isCurrent
                  ? "bg-primary-50 dark:bg-primary-900/25 text-primary-700 dark:text-primary-300 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:bg-[var(--surface-muted)] hover:text-gray-900 dark:hover:text-gray-200",
                isDragOver && "ring-1 ring-primary-400 ring-offset-1 bg-primary-50 dark:bg-primary-900/20",
              )}
              style={{ paddingLeft: `${depth * 18 + 8}px` }}
              onClick={() => onFolderSelect(folder.id)}
            >
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => { e.stopPropagation(); toggleExpand(folder.id); }}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
              >
                {hasChildren ? (
                  isExpanded
                    ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                    : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                ) : (
                  <span className="inline-block w-3.5" />
                )}
              </button>

              <FolderOpen className="h-4 w-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate">{folder.name}</span>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button type="button" onClick={(e) => { e.stopPropagation(); setRenamingId(folder.id); setRenameValue(folder.name); }} className="p-1 rounded hover:bg-primary-100 dark:hover:bg-primary-900/40 text-gray-400 hover:text-primary-600">
                  <Edit3 className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedFolder(folder); setDeleteOpen(true); }} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {hasChildren && isExpanded && renderTree(folder.children!, depth + 1)}
          </div>
        );
      })}
    </div>
  );

  const [viewMode, setViewMode] = useState<"grid" | "tree">("grid");

  return (
    <aside className="w-full h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)] space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {t("folders.title")}
          </h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-[var(--surface-muted)] hover:text-primary-600 transition-colors"
            title={t("common.newFolder")}
          >
            <FolderPlus className="h-4 w-4" />
          </button>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 bg-[var(--surface-muted)] rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-md transition-colors",
              viewMode === "grid"
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <Archive className="h-3.5 w-3.5" /> Grid
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={cn(
              "flex-1 flex items-center justify-center gap-1 text-[11px] font-medium py-1.5 rounded-md transition-colors",
              viewMode === "tree"
                ? "bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 shadow-sm"
                : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            )}
          >
            <FolderOpen className="h-3.5 w-3.5" /> Tree
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface-muted)]">
        <button
          onClick={() => onFolderSelect(null)}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            currentFolderId === null
              ? "text-primary-600 font-semibold"
              : "text-gray-500 hover:text-primary-500"
          )}
        >
          <Home className="h-3.5 w-3.5" />
          {t("common.noFolder")}
        </button>
      </div>

      {/* Folder list */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {flatLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
          </div>
        ) : tree.length === 0 ? (
          <div className="text-center py-10 px-2">
            <div className="p-4 bg-[var(--surface-muted)] rounded-2xl mx-auto w-fit mb-3">
              <FolderOpen className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500">{t("folders.noFolders")}</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-3 text-[11px] font-medium text-primary-500 hover:underline"
            >
              + {t("common.newFolder")}
            </button>
          </div>
        ) : (
          viewMode === "grid"
            ? renderFolderGrid(tree)
            : renderTree(tree)
        )}
      </div>

      {/* File count badge */}
      <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--surface-muted)]">
        <p className="text-[10px] text-gray-400 text-center">
          {files.length} file{files.length !== 1 ? "s" : ""} &middot; {tree.length} folder{tree.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Modals */}
      <NewFolderModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />

      {selectedFolder && (
        <>
          <EditFolderModal
            isOpen={editOpen}
            onClose={() => { setEditOpen(false); setSelectedFolder(null); setRenamingId(null); setRenameValue(""); }}
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
    </aside>
  );
}
