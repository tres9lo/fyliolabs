"use client";

import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();
  const appName = t("app.name");

  return (
    <div className="mt-8 border-t border-[var(--border)] pt-6 text-center space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        {t("footer.copyright", { year, app: appName })}
      </p>
      <div className="flex justify-center gap-4 text-[10px] text-gray-400 dark:text-gray-500">
        <a href="/privacy" className="hover:text-primary-500 hover:underline transition-colors">Privacy Policy</a>
        <span>&middot;</span>
        <a href="/terms" className="hover:text-primary-500 hover:underline transition-colors">Terms & Conditions</a>
      </div>
    </div>
  );
}
