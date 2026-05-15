"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileList } from "@/components/file/file-list";
import { FileDetailPanel } from "@/components/file/file-detail-panel";
import { Search, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import type { FileRecord } from "@/types/file";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [results, setResults] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);
  const [searched, setSearched] = useState(false);

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
      if (json.success) setResults(json.data);
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
    setResults([]);
    setSearched(false);
    setSelectedFile(null);
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

      <div>
        {searched && (
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {t("search.results", { count: results.length })}
          </h2>
        )}
        <Card className="p-6">
          <FileList
            files={results}
            loading={loading}
            emptyMessage={t("search.noResults")}
            onFileClick={setSelectedFile}
          />
        </Card>
      </div>

      <FileDetailPanel
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onUpdate={(updated) => setResults(prev => prev.map(f => f.id === updated.id ? updated : f))}
        onDelete={(id) => setResults(prev => prev.filter(f => f.id !== id))}
      />
    </div>
  );
}
