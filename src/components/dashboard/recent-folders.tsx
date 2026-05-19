import { Card } from "@/components/ui/card";
import { FolderOpen, Loader2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import type { Folder } from "@/types/folder";

interface RecentFoldersSectionProps {
  folders: Folder[];
  loading: boolean;
}

export function RecentFoldersSection({ folders, loading }: RecentFoldersSectionProps) {
  const t = useTranslations("dashboard");

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("recentFolders")}
        </h3>
        <Link
          href="/folders"
          className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-500 font-medium flex items-center gap-1"
        >
          {t("viewAll")}
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
        </div>
      ) : folders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FolderOpen className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noFoldersYet")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {folder.description && <span>{folder.description} &middot; </span>}
                  {formatDate(folder.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
