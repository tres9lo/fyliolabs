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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("settings.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        <LanguageSettings />
        <ProfileSettingsForm />
      </div>
    </div>
  );
}
