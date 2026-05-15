"use client";

import { useState, useEffect } from "react";
import { UploadZone } from "@/components/file/upload-zone";
import { FileList } from "@/components/file/file-list";
import { Card } from "@/components/ui/card";
import { FolderSelect } from "@/components/folder/folder-select";
import { FileDetailPanel } from "@/components/file/file-detail-panel";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import type { FileRecord } from "@/types/file";

export default function FilesPage() {
  const t = useTranslations();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchFiles = async () => {
    try {
      const params = selectedFolder ? `?folder_id=${selectedFolder}` : "?all=true";
      const res = await fetch(`/api/files${params}`);
      const json = await res.json();
      if (json.success) setFiles(json.data);
    } catch (error) {
      console.error("Failed to fetch files", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedFolder]);

  const handleUploadSuccess = (newFile: FileRecord) => {
    setFiles((prev) => [newFile, ...prev]);
  };

  const handleFileUpdate = (updated: FileRecord) => {
    setFiles((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  const handleFileDelete = (deletedId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== deletedId));
    setSelectedFile(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

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
        // toast if needed
      } else {
        const json = await res.json();
        throw new Error(json.error || "Failed to create ZIP");
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("files.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("files.subtitle")}
        </p>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("files.uploadLabel")}
          </label>
          <FolderSelect value={selectedFolder} onChange={setSelectedFolder} />
        </div>
        <UploadZone onUploadSuccess={handleUploadSuccess} />
      </Card>

      {/* Selection bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-4 z-50">
          <span className="text-sm font-medium">
            {selectedIds.length} file{selectedIds.length > 1 ? "s" : ""} selected
          </span>
          <Button size="sm" variant="secondary" onClick={clearSelection}>
            {t("common.cancel")}
          </Button>
          <Button size="sm" onClick={handleDownloadZip} icon={<Download className="h-4 w-4" />}>
            {t("common.download")} ZIP
          </Button>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("files.yourFiles")}
        </h2>
        <Card className="p-6">
          <FileList
            files={files}
            loading={loading}
            onFileClick={setSelectedFile}
            selectedIds={selectedIds}
            onToggle={toggleSelection}
          />
        </Card>
      </div>

      <FileDetailPanel
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={handleFileUpdate}
        onDelete={handleFileDelete}
      />
    </div>
  );
}
