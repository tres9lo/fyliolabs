"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/types/profile";
import { Save, User, Cloud } from "lucide-react";
import type { ProfileUpdateInput } from "@/types/profile";

export function ProfileSettingsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const { addToast } = useToast();
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      full_name: "",
      avatar_url: "",
      cloudinary_cloud_name: "",
      cloudinary_api_key: "",
      cloudinary_api_secret: "",
      cloudinary_secure: false,
    },
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        const result = await response.json();

        if (result.success && result.data) {
          reset({
            full_name: result.data.full_name || "",
            avatar_url: result.data.avatar_url || "",
            cloudinary_cloud_name: result.data.cloudinary_cloud_name || "",
            cloudinary_api_key: "", // never prefill secret fields
            cloudinary_api_secret: "",
            cloudinary_secure: result.data.cloudinary_secure || false,
          });
        }
      } catch {
        addToast({
          title: tCommon("error"),
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoadingData(false);
      }
    };

    loadProfile();
  }, [reset, addToast, tCommon]);

  const onSubmit = async (data: ProfileUpdateInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        addToast({
          title: tCommon("success"),
          description: "Profile updated successfully",
          variant: "success",
        });
        reset({
          ...data,
          cloudinary_api_key: "",
          cloudinary_api_secret: "",
        });
      } else {
        addToast({
          title: tCommon("error"),
          description: result.error || "Failed to update profile",
          variant: "destructive",
        });
      }
    } catch (err: unknown) {
      addToast({
        title: tCommon("error"),
        description: err instanceof Error ? err.message : "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("basicInfo")}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("fullName")} error={errors.full_name?.message}>
              <Input type="text" placeholder="John Doe" className="bg-[var(--surface-muted)]" {...register("full_name")} />
            </FormField>

            <FormField label={t("avatarUrl")} error={errors.avatar_url?.message}>
              <Input type="url" placeholder="https://example.com/avatar.jpg" className="bg-[var(--surface-muted)]" {...register("avatar_url")} />
            </FormField>
          </div>
        </div>

        {/* Cloudinary Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <Cloud className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {t("cloudinary")}
              </h3>
            </div>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              {t("warning")}
            </p>
          </div>

          <FormField label={t("cloudName")} error={errors.cloudinary_cloud_name?.message}>
            <Input type="text" placeholder="your-cloud-name" className="bg-[var(--surface-muted)]" {...register("cloudinary_cloud_name")} />
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label={t("apiKey")} error={errors.cloudinary_api_key?.message}>
              <Input type="password" placeholder="Enter API key" className="bg-[var(--surface-muted)]" {...register("cloudinary_api_key")} />
            </FormField>

            <FormField label={t("apiSecret")} error={errors.cloudinary_api_secret?.message}>
              <Input type="password" placeholder="Enter API secret" className="bg-[var(--surface-muted)]" {...register("cloudinary_api_secret")} />
            </FormField>
          </div>

          <FormField label={t("secure")}>
            <label className="inline-flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] hover:border-primary-300 dark:hover:border-primary-700 transition-colors w-full sm:w-auto">
              <input
                type="checkbox"
                {...register("cloudinary_secure")}
                className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("secure")}
              </span>
            </label>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => reset()}
            disabled={!isDirty || isLoading}
            className="rounded-xl"
          >
            {tCommon("resetForm")}
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<Save className="h-4 w-4" />} className="rounded-xl">
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default ProfileSettingsForm;
