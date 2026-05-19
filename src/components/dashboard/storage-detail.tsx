"use client";

import { Loader2, ImageIcon, Film, Music, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatFileSize } from "@/lib/utils";

interface StorageEntry {
  type: string;
  label: string;
  bytes: number;
}

interface StorageDetailProps {
  breakdown: StorageEntry[];
  total: number;
  loading?: boolean;
}

const typeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  other: <FileText className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  image: "bg-green-500",
  video: "bg-purple-500",
  audio: "bg-pink-500",
  document: "bg-blue-500",
  other: "bg-gray-500",
};

export function StorageDetail({
  breakdown,
  total,
  loading,
}: StorageDetailProps) {
  const t = useTranslations("dashboard");

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
        {t("storageBreakdown")}
      </h3>

      {breakdown.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("noStorageData")}
        </p>
      ) : (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden flex">
            {breakdown.map((entry) => (
              <div
                key={entry.type}
                className={cn("transition-all", typeColors[entry.type] || "bg-gray-500")}
                style={{
                  width: `${Math.max((entry.bytes / total) * 100, 1)}%`,
                  minWidth: breakdown.length > 0 ? "2px" : "0",
                }}
              />
            ))}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3">
            {breakdown.map((entry) => (
              <div
                key={entry.type}
                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white", typeColors[entry.type] || "bg-gray-500")}>
                  {typeIcons[entry.type] || <FileText className="h-3 w-3" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                    {entry.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(entry.bytes)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
