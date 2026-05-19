"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema } from "@/types/profile";
import { Save } from "lucide-react";
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
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-1 h-6 bg-primary-500 rounded-full" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t("basicInfo")}
            </h3>
          </div>

          <FormField
            label={t("fullName")}
            error={errors.full_name?.message}
          >
            <Input
              type="text"
              placeholder="John Doe"
              {...register("full_name")}
            />
          </FormField>

          <FormField
            label={t("avatarUrl")}
            error={errors.avatar_url?.message}
          >
            <Input
              type="url"
              placeholder="https://example.com/avatar.jpg"
              {...register("avatar_url")}
            />
          </FormField>
        </div>

        {/* Cloudinary Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
            <div className="w-1 h-6 bg-primary-500 rounded-full" />
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {t("cloudinary")}
            </h3>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-4">
            <p className="text-xs text-amber-800 dark:text-amber-200">
              {t("warning")}
            </p>
          </div>

          <FormField
            label={t("cloudName")}
            error={errors.cloudinary_cloud_name?.message}
          >
            <Input
              type="text"
              placeholder="your-cloud-name"
              {...register("cloudinary_cloud_name")}
            />
          </FormField>

          <FormField
            label={t("apiKey")}
            error={errors.cloudinary_api_key?.message}
          >
            <Input
              type="password"
              placeholder="Enter API key"
              {...register("cloudinary_api_key")}
            />
          </FormField>

          <FormField
            label={t("apiSecret")}
            error={errors.cloudinary_api_secret?.message}
          >
            <Input
              type="password"
              placeholder="Enter API secret"
              {...register("cloudinary_api_secret")}
            />
          </FormField>

          <FormField label={t("secure")}>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register("cloudinary_secure")}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {t("secure")}
              </span>
            </label>
          </FormField>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => reset()}
            disabled={!isDirty || isLoading}
          >
            {tCommon("resetForm")}
          </Button>
          <Button type="submit" isLoading={isLoading} icon={<Save className="h-4 w-4" />}>
            {t("saveChanges")}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export default ProfileSettingsForm;
