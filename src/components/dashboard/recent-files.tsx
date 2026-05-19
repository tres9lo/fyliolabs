import { Card } from "@/components/ui/card";
import { FileText, Image as ImageIcon, Film, Music, File, Loader2, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { cn, formatFileSize, formatDate, formatFileType } from "@/lib/utils";
import type { FileRecord } from "@/types/file";

interface RecentFilesSectionProps {
  files: FileRecord[];
  loading: boolean;
}

const getFileIcon = (fileType: string) => {
  switch (fileType) {
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

export function RecentFilesSection({ files, loading }: RecentFilesSectionProps) {
  const t = useTranslations("dashboard");

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("recentFiles")}
        </h3>
        <Link
          href="/files"
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
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <File className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("noFilesYet")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              {file.file_type === "image" && file.cloudinary_url ? (
                <img
                  src={`${file.cloudinary_url}?w=48&h=48&crop=thumb`}
                  alt={file.display_name}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                  {getFileIcon(file.file_type)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.display_name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.file_size)} &middot; {formatFileType(file.file_type)} &middot; {formatDate(file.created_at)}
                </p>
              </div>
              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0",
                  file.is_public
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                )}
              >
                {file.is_public ? t("public") : "Private"}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
