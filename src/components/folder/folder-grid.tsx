"use client";

import { useTranslations } from "next-intl";
import { FolderIcon } from "@/components/ui/folder-icon";
import { Pencil, Trash2 } from "lucide-react";
import type { Folder } from "@/types/folder";

interface FolderGridProps {
  folders: Folder[];
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  onNavigate?: (folder: Folder) => void;
}

export function FolderGrid({ folders, onRename, onDelete, onNavigate }: FolderGridProps) {
  const t = useTranslations();

  if (folders.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        {t("folders.noFolders")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {folders.map((folder) => {
        return (
          <div
            key={folder.id}
            className="group relative flex flex-col items-center justify-center p-6 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 cursor-pointer"
            onClick={() => onNavigate && onNavigate(folder)}
          >
            {/* Context menu for grid item */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRename(folder); }}
                className="p-1.5 hover:bg-[var(--surface-muted)] rounded-lg text-gray-500 hover:text-primary-600 transition-colors"
                title="Rename"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
                className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            <FolderIcon size="xl" className="mb-4 group-hover:scale-110" />
            
            <h3 className="text-sm font-medium text-gray-900 dark:text-white text-center w-full break-words px-2">
              {folder.name}
            </h3>
            {folder.children && folder.children.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {folder.children.length} items
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
