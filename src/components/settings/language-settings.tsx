"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
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
    <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm">
      <div className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              {t("language")}
            </h3>
            <p className="text-xs text-gray-500">{t("selectLanguage")}</p>
          </div>
        </div>

        <div>
          <select
            value={locale}
            onChange={(e) => handleChange(e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all cursor-pointer hover:border-primary-300 dark:hover:border-primary-700"
          >
            {locales.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}