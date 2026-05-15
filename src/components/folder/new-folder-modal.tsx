"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { folderCreateSchema } from "@/types/folder";
import { FolderPlus, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface NewFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; description?: string; parent_id?: string | null }) => Promise<void>;
  parentId?: string | null;
}

export function NewFolderModal({
  isOpen,
  onClose,
  onCreate,
  parentId,
}: NewFolderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(folderCreateSchema),
    defaultValues: { name: "", description: "", parent_id: parentId ?? null },
  });

  useEffect(() => {
    if (isOpen) {
      reset({ name: "", description: "", parent_id: parentId ?? null });
      setError(null);
    }
  }, [isOpen, reset, parentId]);

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await onCreate(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("folders.createFolder")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600">
            {error}
          </div>
        )}

        <FormField label={t("common.folderName")} error={errors.name?.message} required>
          <Input {...register("name")} placeholder={t("common.folderName")} />
        </FormField>

        <FormField label={t("common.description")} error={errors.description?.message}>
          <Input {...register("description")} placeholder={t("common.description")} />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            icon={<FolderPlus className="h-4 w-4" />}
          >
            {t("common.createFolder")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
