"use client";

import { useState, useEffect, useCallback } from "react";
import { FolderBrowser } from "@/components/file/folder-browser";
import { UploadZone } from "@/components/file/upload-zone";
import { FileList } from "@/components/file/file-list";
import Card from "@/components/ui/card";
import { FileDetailPanel } from "@/components/file/file-detail-panel";
import Button from "@/components/ui/button";
import { Download, FolderOpen, Loader2, ArrowUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { FileRecord, Folder } from "@/types";

export default function FilesPage() {
  const t = useTranslations();
  const tFileDetail = useTranslations("fileDetail");
  const tCommon = useTranslations("common");

  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moving, setMoving] = useState(false);

  const loadBreadcrumb = useCallback(async () => {
    if (currentFolderId === null) { setCurrentFolder(null); return; }
    try {
      const res = await fetch(`/api/folders/${currentFolderId}`);
      const json = await res.json();
      if (json.success) setCurrentFolder(json.data);
    } catch { /* ignore */ }
  }, [currentFolderId]);

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = currentFolderId
        ? `?folder_id=${currentFolderId}`
        : "?all=true";
      const res = await fetch(`/api/files${params}`);
      const json = await res.json();
      if (json.success) setFiles(json.data ?? []);
    } catch (err: unknown) {
      console.error("Failed to fetch files", err);
    } finally {
      setLoading(false);
    }
  }, [currentFolderId]);

  useEffect(() => {
    void loadFiles();
  }, [loadFiles]);

  useEffect(() => {
    void loadBreadcrumb();
  }, [loadBreadcrumb]);

  const handleUploadSuccess = (newFile: FileRecord) => {
    setFiles((prev) => [newFile, ...prev]);
    toast.success(tCommon("success"), {
      description: `${newFile.display_name} uploaded`,
    });
  };

  const handleFileUpdate = (updated: FileRecord) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    if (selectedFile?.id === updated.id) setSelectedFile(updated);
  };

  const handleFileDelete = (deletedId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== deletedId));
    setSelectedFile(null);
  };

  const handleMoveFile = async (fileId: string, targetFolderId: string) => {
    const prevFiles = files;
    // Optimistic: show it moved
    setMoving(true);
    try {
      const res = await fetch(`/api/files/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: targetFolderId }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        // File moved away from current view — remove it
        setFiles((prev) => prev.filter((f) => f.id !== fileId));
        toast.success(tCommon("success"), { description: tFileDetail("movedToFolder") });
      } else {
        toast.error(tCommon("error"), { description: json.error || "Failed to move file" });
      }
    } catch (err: unknown) {
      toast.error(tCommon("error"), { description: err instanceof Error ? err.message : "Move error" });
    } finally {
      setMoving(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedIds([]);

  const handleDownloadZip = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await fetch("/api/files/zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: selectedIds }),
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `fyliolabs_files_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        clearSelection();
        toast.success(tCommon("success"), { description: "ZIP downloaded" });
      } else {
        const json = await res.json();
        throw new Error(json.error || "Failed to create ZIP");
      }
    } catch (err: unknown) {
      toast.error(tCommon("error"), { description: err instanceof Error ? err.message : "ZIP error" });
    }
  };

  const handleFileConvert = (newFile: FileRecord) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const folderLabel = currentFolder
    ? currentFolder.name
    : tCommon("noFolder");

  return (
    <div className="flex gap-0 h-full min-h-0">
      {/* ─── Folder Browser sidebar ─── */}
      <FolderBrowser
        files={files}
        loading={loading}
        currentFolderId={currentFolderId}
        onFolderSelect={(id) => {
          setCurrentFolderId(id);
          setSelectedIds([]);
          setSelectedFile(null);
        }}
        onFilesChange={loadFiles}
        onMoveFile={handleMoveFile}
      />

      {/* ─── Main content ─── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Breadcrumb + page title */}
        <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">
              {t("files.title")}
            </h1>
            <div className="flex items-center gap-1.5 mt-1">
              <button
                onClick={() => { setCurrentFolderId(null); }}
                className={cn(
                  "text-sm transition-colors",
                  !currentFolderId ? "text-gray-900 dark:text-white font-semibold" : "text-gray-500 hover:text-primary-500 dark:text-gray-400"
                )}
              >
                {tCommon("noFolder")}
              </button>
              {currentFolder && (
                <>
                  <ChevronSmall className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    {currentFolder.name}
                  </span>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {t("files.subtitle")}
            </p>
          </div>

          <button
            onClick={() => { setCurrentFolderId(null); setSelectedFile(null); setSelectedIds([]); void loadFiles(); }}
            className="flex items-center gap-1.5 text-xs font-medium text-primary-500 hover:text-primary-400 transition-colors"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {t("files.allFiles")}
          </button>
        </div>

        {/* Upload zone */}
        <Card className="mb-5 border-[var(--border)] shadow-sm bg-[var(--surface)]">
          <div className="p-5">
            <UploadZone onUploadSuccess={handleUploadSuccess} selectedFolder={currentFolderId} />
          </div>
        </Card>

        {/* Your Files section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary-500" />
            {t("files.yourFiles")}
            <span className="text-xs font-normal text-gray-400">
              {currentFolderId ? `(${folderLabel})` : ""}
            </span>
          </h2>
          {files.length > 0 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {files.length} file{files.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <Card className="flex-1 border-[var(--border)] shadow-sm bg-[var(--surface)] overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <FileList
              files={files}
              loading={loading}
              onFileClick={setSelectedFile}
              selectedIds={selectedIds}
              onToggle={toggleSelection}
            />
          </div>
        </Card>

        {/* Selection bar */}
        {selectedIds.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-xl shadow-lg flex items-center gap-4 z-50 animate-[slide-up_250ms_ease-out]">
            <span className="text-sm font-medium">
              {selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} selected
            </span>
            <Button size="sm" variant="secondary" onClick={clearSelection}>
              {tCommon("cancel")}
            </Button>
            <Button size="sm" onClick={handleDownloadZip} icon={<Download className="h-4 w-4" />}>
              {tCommon("download")} ZIP
            </Button>
          </div>
        )}
      </div>

      <FileDetailPanel
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={handleFileUpdate}
        onDelete={handleFileDelete}
        onConvert={handleFileConvert}
      />

      {moving && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50 text-sm animate-[slide-up_250ms_ease-out]">
          <Loader2 className="h-4 w-4 animate-spin" />
          {tFileDetail("moving")}
        </div>
      )}
    </div>
  );
}

function ChevronSmall({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
    </svg>
  );
}
