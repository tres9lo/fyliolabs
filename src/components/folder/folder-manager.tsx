"use client";

import { useState, useCallback } from "react";
import { FolderTree } from "./folder-tree";
import { NewFolderModal } from "./new-folder-modal";
import { EditFolderModal } from "./edit-folder-modal";
import { DeleteFolderModal } from "./delete-folder-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
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

  // Modal states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/folders?tree=true");
      const json = await res.json();
      if (json.success) setFolders(json.data);
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
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to create folder");
    }
    setCreateOpen(false);
    await refresh();
    addToast({
      title: t("toast.success"),
      description: "Folder created",
      variant: "success",
    });
  };

  const handleUpdate = async (id: string, data: { name: string; description: string | null }) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to update folder");
    }
    setEditOpen(false);
    setSelectedFolder(null);
    await refresh();
    addToast({
      title: t("toast.success"),
      description: "Folder updated",
      variant: "success",
    });
  };

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/folders/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || "Failed to delete folder");
    }
    setDeleteOpen(false);
    setSelectedFolder(null);
    await refresh();
    addToast({
      title: t("toast.success"),
      description: "Folder deleted",
      variant: "success",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("folders.yourFolders")}
        </h2>
        <Button onClick={() => setCreateOpen(true)} icon={<Plus className="h-4 w-4" />}>
          {t("common.newFolder")}
        </Button>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
          </div>
        ) : (
          <FolderTree
            folders={folders}
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
            onClose={() => {
              setEditOpen(false);
              setSelectedFolder(null);
            }}
            folder={selectedFolder}
            onUpdate={handleUpdate}
          />

          <DeleteFolderModal
            isOpen={deleteOpen}
            onClose={() => {
              setDeleteOpen(false);
              setSelectedFolder(null);
            }}
            folder={selectedFolder}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
