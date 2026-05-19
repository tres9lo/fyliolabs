"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { loginSchema } from "@/types/auth";
import type { LoginInput } from "@/types/auth";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import FormField from "@/components/ui/form-field";

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "Login failed");
        setIsLoading(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t("emailLabel")}
          error={errors.email?.message}
          required
        >
          <Input
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            autoComplete="email"
          />
        </FormField>

        <FormField
          label={t("passwordLabel")}
          error={errors.password?.message}
          required
        >
          <Input
            type="password"
            placeholder="••••••••"
            {...register("password")}
            autoComplete="current-password"
          />
        </FormField>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t("signIn")}
        </Button>
      </form>
    </Card>
  );
}
