import type { Metadata } from "next";
import LoginForm from "@/components/auth/login-form";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Sign in - Fyliolabs",
  description: "Sign in to your Fyliolabs account",
};

export default async function LoginPage() {
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("auth.loginTitle")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t("auth.loginSubtitle")}
        </p>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("auth.noAccount")}{" "}
        <a
          href="/register"
          className="text-primary-600 hover:text-primary-500 dark:text-primary-500 font-medium"
        >
          {t("auth.createAccount")}
        </a>
      </p>
    </div>
  );
}
