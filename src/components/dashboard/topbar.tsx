"use client";

import { useAuth } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { useTranslations } from "next-intl";

export function TopBar() {
  const { user, loading } = useAuth();
  const t = useTranslations();

  if (loading) {
    return (
      <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm text-gray-500">{t("common.loading")}</span>
        </div>
      </header>
    );
  }

  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";
  const email = user?.email || "";

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t("topbar.dashboard")}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {t("topbar.welcomeBack")}, {fullName}
        </p>
      </div>

      <div className="flex items-center gap-4">
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
            url={user?.user_metadata?.avatar_url}
          />
        </div>
      </div>
    </header>
  );
}
