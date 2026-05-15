"use client";

import { FileText, Image as ImageIcon, Film, Music, File, Check } from "lucide-react";
import { cn, formatFileSize } from "@/lib/utils";
import type { FileRecord } from "@/types/file";

interface FileCardProps {
  file: FileRecord;
  selected?: boolean;
  onSelect?: () => void;
  onClick?: () => void;
}

export function FileCard({ file, selected = false, onSelect, onClick }: FileCardProps) {
  const getIcon = () => {
    switch (file.file_type) {
      case "image":
        return <ImageIcon className="h-8 w-8 text-green-500" />;
      case "video":
        return <Film className="h-8 w-8 text-purple-500" />;
      case "audio":
        return <Music className="h-8 w-8 text-pink-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  return (
    <div
      className={cn(
        "relative border rounded-lg overflow-hidden bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer",
        selected
          ? "border-primary-500 ring-2 ring-primary-500"
          : "border-gray-200 dark:border-gray-700"
      )}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div
        className="absolute top-2 left-2 z-10"
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <div
          className={cn(
            "w-5 h-5 rounded border flex items-center justify-center transition-colors",
            selected
              ? "bg-primary-600 border-primary-600"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
          )}
        >
          {selected && <Check className="h-3 w-3 text-white" />}
        </div>
      </div>

      <div className="h-32 w-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        {file.file_type === "image" && file.cloudinary_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${file.cloudinary_url}?w=200&h=200&crop=thumb`}
            alt={file.display_name}
            className="object-cover w-full h-full"
          />
        ) : (
          getIcon()
        )}
      </div>
      <div className="p-3">
        <h4 className="font-medium text-sm text-gray-900 dark:text-white truncate" title={file.display_name}>
          {file.display_name}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {formatFileSize(file.file_size)} • {file.file_type}
        </p>
      </div>
    </div>
  );
}
