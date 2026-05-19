"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/card";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { FileList } from "@/components/file/file-list";
import { FolderGrid } from "@/components/folder/folder-grid";
import { FileDetailPanel } from "@/components/file/file-detail-panel";
import { EditFolderModal } from "@/components/folder/edit-folder-modal";
import { DeleteFolderModal } from "@/components/folder/delete-folder-modal";
import { Search, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FileRecord } from "@/types/file";
import type { Folder } from "@/types/folder";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  
  const [results, setResults] = useState<{ files: FileRecord[]; folders: Folder[] }>({ files: [], folders: [] });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  
  // Folder Modals
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [deletingFolder, setDeletingFolder] = useState<Folder | null>(null);

  const t = useTranslations();

  const performSearch = async (searchQuery: string, tags: string[]) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (tags.length) params.set("tags", tags.join(","));
      if (sortBy) params.set("sort", sortBy);
      if (order) params.set("order", order);
      const res = await fetch(`/api/search?${params}`);
      const json = await res.json();
      if (json.success) {
        setResults(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
    performSearch(query, tags);
  };

  const handleReset = () => {
    setQuery("");
    setTagsInput("");
    setSortBy("created_at");
    setOrder("desc");
    setResults({ files: [], folders: [] });
    setSearched(false);
    setSelectedFile(null);
  };

  const handleFolderNavigate = (folder: Folder) => {
    router.push(`/files?folder=${folder.id}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("search.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("search.subtitle")}
        </p>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("search.searchPlaceholder")}
            </label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.searchPlaceholder")}
            />
          </div>

          <div className="min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {t("search.tagsLabel")}
            </label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t("search.tagsPlaceholder")}
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" isLoading={loading} icon={<Search className="h-4 w-4" />}>
              {t("search.searchButton")}
            </Button>
            <Button type="button" variant="secondary" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </Card>

      {searched && (
        <div className="space-y-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("search.results", { count: results.files.length + results.folders.length })}
          </h2>
          
          {/* Folders Section */}
          {(results.folders.length > 0 || loading) && (
            <div className="space-y-4">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 pb-2">
                Found Folders ({results.folders.length})
              </h3>
              <FolderGrid
                folders={results.folders}
                onRename={setEditingFolder}
                onDelete={setDeletingFolder}
                onNavigate={handleFolderNavigate}
              />
            </div>
          )}

          {/* Files Section */}
          <div className="space-y-4">
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-800 pb-2">
              Found Files ({results.files.length})
            </h3>
            <FileList
              files={results.files}
              loading={loading}
              emptyMessage={t("search.noResults")}
              onFileClick={setSelectedFile}
            />
          </div>
        </div>
      )}

      {/* File Detail Modal */}
      <FileDetailPanel
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={(updated) => setResults(prev => ({
          ...prev,
          files: prev.files.map(f => f.id === updated.id ? updated : f)
        }))}
        onDelete={(id) => setResults(prev => ({
          ...prev,
          files: prev.files.filter(f => f.id !== id)
        }))}
      />

      {/* Folder Modals */}
      {editingFolder && (
        <EditFolderModal
          isOpen={true}
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onUpdate={async (id, data) => {
            const res = await fetch(`/api/folders/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            const json = await res.json();
            if (json.success) {
              setResults(prev => ({
                ...prev,
                folders: prev.folders.map(f => f.id === id ? { ...f, ...data } : f)
              }));
              setEditingFolder(null);
            } else {
              throw new Error(json.error || "Update failed");
            }
          }}
        />
      )}

      {deletingFolder && (
        <DeleteFolderModal
          isOpen={true}
          folder={deletingFolder}
          onClose={() => setDeletingFolder(null)}
          onDelete={async (id) => {
            const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
            const json = await res.json();
            if (json.success) {
              setResults(prev => ({
                ...prev,
                folders: prev.folders.filter(f => f.id !== id)
              }));
              setDeletingFolder(null);
            } else {
              throw new Error(json.error || "Delete failed");
            }
          }}
        />
      )}
    </div>
  );
}
