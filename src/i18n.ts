import { defineRouting, getRequestConfig } from "next-intl/routing";
import { notFound } from "next/navigation";

export const i18n = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "fr", "sw", "rw"],

  // The default locale
  defaultLocale: "en",

  // The prefix for the locales (as-needed means URLs like /en/... are optional)
  localePrefix: "as-needed",
});

export const getConfig = getRequestConfig(async ({ locale }) => {
  if (!i18n.locales.includes(locale as any)) {
    notFound();
  }

  const messages = (await import(`./messages/${locale}.json`)).default;
  return { messages };
});
