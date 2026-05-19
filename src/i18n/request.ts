import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { i18n } from "./index";

export default getRequestConfig(async () => {
  // Get locale from cookie or use default
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || i18n.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
