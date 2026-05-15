import type { Metadata } from "next";
import Logo from "@/components/ui/logo";
import { getTranslator } from "next-intl/server";

export const metadata: Metadata = {
  title: "Authentication - Fyliolabs",
  description: "Sign in or create your Fyliolabs account",
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslator();
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
      <Logo className="mb-8" />
      <div className="w-full max-w-md">{children}</div>
      <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © {year} {t("app.name")}. {t("footer.rights")}
      </p>
    </div>
  );
}
