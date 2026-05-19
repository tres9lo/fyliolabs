import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ProfileSettingsForm from "@/components/settings/profile-settings-form";
import { LanguageSettings } from "@/components/settings/language-settings";

export const metadata: Metadata = {
  title: "Settings - Fyliolabs",
  description: "Manage your account settings",
};

export default async function SettingsPage() {
  const t = await getTranslations();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display tracking-tight">{t("settings.title")}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg">{t("settings.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <LanguageSettings />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <ProfileSettingsForm />
        </div>
      </div>
    </div>
  );
}
