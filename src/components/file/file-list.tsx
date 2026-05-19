"use client";

import { FileCard } from "@/components/file/file-card";
import { Loader2 } from "lucide-react";
import type { FileRecord } from "@/types/file";

export function FileList({ 
  files, 
  loading, 
  emptyMessage = "No files uploaded yet",
  onFileClick,
  selectedIds = [],
  onToggle
}: { 
  files: FileRecord[];
  loading?: boolean;
  emptyMessage?: string;
  onFileClick?: (file: FileRecord) => void;
  selectedIds?: string[];
  onToggle?: (id: string) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
      {files.map((file) => (
        <FileCard 
          key={file.id} 
          file={file}
          selected={selectedIds.includes(file.id)}
          onSelect={onToggle ? () => onToggle(file.id) : undefined}
          onClick={onFileClick ? () => onFileClick(file) : undefined}
        />
      ))}
    </div>
  );
}
