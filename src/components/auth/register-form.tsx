"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { registerSchema } from "@/types/auth";
import type { RegisterInput } from "@/types/auth";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import FormField from "@/components/ui/form-field";

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("auth");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(result.error || "Registration failed");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          label={t("fullName")}
          error={errors.full_name?.message}
          required
        >
          <Input
            type="text"
            placeholder="John Doe"
            {...register("full_name")}
            autoComplete="name"
          />
        </FormField>

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
            autoComplete="new-password"
          />
        </FormField>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t("createAccount")}
        </Button>
      </form>
    </Card>
  );
}
