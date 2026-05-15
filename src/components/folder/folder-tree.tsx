"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Folder,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Folder } from "@/types/folder";

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
    <div className="space-y-1">
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
  const [expanded, setExpanded] = useState(true);
  const hasChildren = folder.children && folder.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group"
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
      >
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex-shrink-0"
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-500" />
            )
          ) : (
            <span className="inline-block w-4" />
          )}
        </button>

        <Folder className="h-4 w-4 text-blue-500 flex-shrink-0" />

        <span className="flex-1 text-sm text-gray-900 dark:text-white truncate">
          {folder.name}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onRename(folder)}
            className="p-1 hover:text-primary-600 rounded"
            title="Rename"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(folder)}
            className="p-1 hover:text-red-600 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="border-l-2 border-gray-200 dark:border-gray-700 ml-4">
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
