import type { Metadata } from "next";
import RegisterForm from "@/components/auth/register-form";
import { getTranslator } from "next-intl/server";

export const metadata: Metadata = {
  title: "Create account - Fyliolabs",
  description: "Create your Fyliolabs account",
};

export default async function RegisterPage() {
  const t = await getTranslator();

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("auth.registerTitle")}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          {t("auth.registerSubtitle")}
        </p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        {t("auth.haveAccount")}{" "}
        <a
          href="/login"
          className="text-primary-600 hover:text-primary-500 dark:text-primary-500 font-medium"
        >
          {t("auth.signInLink")}
        </a>
      </p>
    </div>
  );
}
