"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Folder } from "@/types/folder";
import { FolderIcon } from "@/components/ui/folder-icon";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  folders: Folder[];
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
}

export function FolderTree({ folders, onRename, onDelete }: FolderTreeProps) {
  const t = useTranslations();

  if (folders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t("folders.noFolders")}
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {folders.map((folder) => (
        <FolderItem
          key={folder.id}
          folder={folder}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

interface FolderItemProps {
  folder: Folder & { children?: Folder[] };
  onRename: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
  depth?: number;
}

function FolderItem({ folder, onRename, onDelete, depth = 0 }: FolderItemProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-2.5 px-3 rounded-xl group cursor-pointer transition-colors duration-200",
          "hover:bg-[var(--surface-muted)] dark:hover:bg-gray-800/50"
        )}
        style={{ paddingLeft: `${depth * 24 + 12}px` }}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn(
            "p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0 transition-colors",
            !hasChildren && "invisible"
          )}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
        </button>

        <FolderIcon 
          size="sm" 
          isOpen={expanded} 
          className="flex-shrink-0"
        />

        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {folder.name}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRename(folder); }}
            className="p-1.5 hover:bg-white dark:hover:bg-gray-700 hover:text-primary-600 rounded-lg shadow-sm transition-all"
            title="Rename"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(folder); }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg shadow-sm transition-all"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="relative mt-1">
          {/* Vertical line connecting children */}
          <div className="absolute left-[20px] top-0 bottom-4 w-px bg-gray-200 dark:bg-gray-700" style={{ left: `${depth * 24 + 20}px` }} />
          
          {folder.children!.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              onRename={onRename}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
