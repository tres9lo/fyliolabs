"use client";

import { useAuth } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

const PAGE_TITLES: Record<string, string> = {
  "/": "dashboard.title",
  "/files": "files.title",
  "/folders": "folders.title",
  "/search": "search.title",
  "/settings": "settings.title",
};

export function TopBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const t = useTranslations();

  if (loading) {
    return (
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">{t("common.loading")}</span>
        </div>
      </header>
    );
  }

  const matchKey = Object.entries(PAGE_TITLES).find(([path]) => pathname === path)?.[0] ?? "/";
  const pageTitleKey = PAGE_TITLES[matchKey] ?? "dashboard.title";
  const pageTitle = t(pageTitleKey);

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const email = user?.email || "";

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {pageTitle}
        </h1>
        {fullName && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("topbar.welcomeBack")}, {fullName}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {fullName && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {fullName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {email}
              </p>
            </div>
            <Avatar
              name={fullName}
              url={
                typeof user?.user_metadata?.avatar_url === 'string'
                  ? user.user_metadata.avatar_url
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </header>
  );
}
