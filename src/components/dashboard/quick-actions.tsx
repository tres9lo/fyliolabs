"use client";

import { 
  Upload, 
  FolderPlus, 
  FileText, 
  Settings,
} from "lucide-react";
import Link from "next/link";
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
    <div className="glass rounded-2xl border border-[var(--border)] shadow-sm p-6 sm:p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-display tracking-tight">
        {t("quickActions")}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          const isAction = !!action.action;
          
          const innerContent = (
            <>
              <div className="p-3 sm:p-4 rounded-xl bg-[var(--surface-muted)] text-gray-700 dark:text-gray-200 group-hover:bg-primary-50 group-hover:text-primary-600 dark:group-hover:bg-primary-900/30 dark:group-hover:text-primary-400 transition-colors duration-200">
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 text-center mt-3">
                {t(action.key)}
              </span>
            </>
          );

          const className = "group flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl glass border border-[var(--border)] hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 cursor-pointer";

          return isAction ? (
            <button
              key={action.key}
              onClick={action.action}
              className={className}
            >
              {innerContent}
            </button>
          ) : (
            <Link
              key={action.key}
              href={action.href}
              className={className}
            >
              {innerContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
