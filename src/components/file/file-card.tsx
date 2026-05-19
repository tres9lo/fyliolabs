"use client";

import { FileText, Image as ImageIcon, Film, Music, File, Check } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/types/file";

interface FileCardProps {
  file: FileRecord;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export function FileCard({ file, selected = false, onSelect, onClick, onDragStart }: FileCardProps) {
  const getIcon = () => {
    switch (file.file_type) {
      case "image":
        return <ImageIcon className="h-8 w-8" style={{ color: "#22c55e" }} />;
      case "video":
        return <Film className="h-8 w-8" style={{ color: "#a855f7" }} />;
      case "audio":
        return <Music className="h-8 w-8" style={{ color: "#ec4899" }} />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", file.id);
        onDragStart?.(e);
      }}
      className={cn(
        "relative border rounded-xl overflow-hidden bg-[var(--surface)] transition-all cursor-pointer",
        "hover:shadow-lg hover:scale-[1.02] hover:border-primary-300 dark:hover:border-primary-700",
        selected
          ? "border-primary-500 ring-2 ring-primary-500 shadow-md"
          : "border-[var(--border)]"
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div
        className="absolute top-3 left-3 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <div
          className={cn(
            "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all",
            selected
              ? "bg-primary-500 border-primary-500"
              : "bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600"
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>

      {/* Drag handle icon */}
      <div
        className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ opacity: 0 }}
      >
        <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <svg className="h-3 w-3 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 14z" />
          </svg>
        </div>
      </div>

      <div className="h-36 w-full bg-[var(--surface-muted)] flex items-center justify-center overflow-hidden">
        {file.file_type === "image" && file.cloudinary_url ? (
          <img
            src={`${file.cloudinary_url}?w=300&h=300&crop=thumb`}
            alt={file.display_name}
            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            {getIcon()}
            <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{file.file_type}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate" title={file.display_name}>
          {file.display_name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {formatFileSize(file.file_size)} &middot; {file.file_type}
        </p>
      </div>
    </div>
  );
}
