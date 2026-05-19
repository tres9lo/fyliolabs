"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const appName = t("app.name");

  return (
    <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-center">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t("footer.copyright", { year, app: appName })}
      </p>
    </div>
  );
}
