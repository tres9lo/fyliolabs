import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SettingsTabs } from "@/components/settings/settings-tabs";

export const metadata: Metadata = {
  title: "Settings - Fyliolabs",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header banner */}
      <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight">{t("settings.title")}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">{t("settings.subtitle")}</p>
      </div>

      {/* Interactive Tabs Container (Clean, compact, no scrolling needed!) */}
      <SettingsTabs />
    </div>
  );
}
