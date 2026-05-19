"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

const locales = [
  { code: "en", name: "English" },
  { code: "fr", name: "Français" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "sw", name: "Kiswahili" },
];

export function LanguageSettings() {
  const t = useTranslations("settings");
  const locale = useLocale();
  const router = useRouter();

  const handleChange = (newLocale: string) => {
    // Set locale cookie for server-side detection
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Refresh to apply new locale
    router.refresh();
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
          <Globe className="h-5 w-5 text-primary-500" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            {t("language")}
          </h3>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t("selectLanguage")}
          </label>
          <select
            value={locale}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {locales.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
}