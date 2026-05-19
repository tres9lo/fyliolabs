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
import { cn } from "@/lib/utils";

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
      <header className="h-16 px-8 flex items-center gap-3 border-b border-[var(--border)] glass z-10 sticky top-0">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
        <span className="text-sm font-medium text-gray-500">{t("common.loading")}</span>
      </header>
    );
  }

  const matchKey = Object.entries(PAGE_TITLES).find(([path]) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  })?.[0] ?? "/";
  const pageTitleKey = PAGE_TITLES[matchKey] ?? "dashboard.title";
  const pageTitle = t(pageTitleKey);
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-white/20 dark:border-white/10 glass z-10 sticky top-0 shadow-sm backdrop-blur-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Fyliolabs</span>
        {pathname !== "/" && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-bold text-gray-900 dark:text-white tracking-wide">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        {/* Quick search indicator */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 dark:bg-black/20 border border-[var(--border)] text-xs font-medium text-gray-500 hover:text-primary-600 hover:border-primary-300 transition-all hover:shadow-sm">
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search... ⌘K</span>
        </button>
        
        <button className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
        </button>

        {fullName && (
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)] cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary-600 transition-colors">
                {fullName}
              </p>
              {user?.email && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                  {user.email}
                </p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
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
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
