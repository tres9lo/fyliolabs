"use client";

import { useAuth } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Search,
  Bell,
  ChevronRight,
  Loader2,
} from "lucide-react";

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
      <header className="h-14 px-6 flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)]">
        <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
        <span className="text-sm text-gray-500">{t("common.loading")}</span>
      </header>
    );
  }

  const matchKey = Object.entries(PAGE_TITLES).find(([path]) => pathname === path)?.[0] ?? "/";
  const pageTitleKey = PAGE_TITLES[matchKey] ?? "dashboard.title";
  const pageTitle = t(pageTitleKey);
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <header className="h-14 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] shadow-sm">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-gray-500 dark:text-gray-400">{t("dashboard.title")}</span>
        {pathname !== "/" && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-medium text-gray-900 dark:text-white">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Quick search indicator */}
        <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">⌘K</span>
        </button>

        {fullName && (
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--border)]">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                {fullName}
              </p>
              {user?.email && (
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
                  {user.email}
                </p>
              )}
            </div>
            <Avatar
              name={fullName}
              size="sm"
              url={
                typeof user?.user_metadata?.avatar_url === "string"
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
