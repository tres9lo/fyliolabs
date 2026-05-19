"use client";

import { 
  Upload, 
  FolderPlus, 
  FileText, 
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

interface QuickActionsProps {
  onUploadClick?: () => void;
}

export function QuickActions({ onUploadClick }: QuickActionsProps) {
  const t = useTranslations("dashboard");

  const actions = [
    { key: "upload", href: "/files", icon: Upload, action: onUploadClick },
    { key: "createFolder", href: "/folders", icon: FolderPlus },
    { key: "browseFiles", href: "/files", icon: FileText },
    { key: "settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {t("quickActions")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const isAction = !!action.action;
          return isAction ? (
            <button
              key={action.key}
              onClick={action.action}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
            >
              <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {t(action.key)}
              </span>
            </button>
          ) : (
            <Link
              key={action.key}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-primary-300 dark:hover:border-primary-700 transition-all"
            >
              <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                {t(action.key)}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
