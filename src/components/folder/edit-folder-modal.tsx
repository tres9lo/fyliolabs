"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { folderUpdateSchema } from "@/types/folder";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Folder } from "@/types/folder";

interface EditFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder;
  onUpdate: (id: string, data: { name: string; description: string | null }) => Promise<void>;
}

export function EditFolderModal({
  isOpen,
  onClose,
  folder,
  onUpdate,
}: EditFolderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(folderUpdateSchema),
    defaultValues: {
      name: folder.name,
      description: folder.description || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: folder.name,
        description: folder.description || "",
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setError(null);
    }
  }, [isOpen, folder, reset]);

  const onSubmit = async (data: unknown) => {
    setIsLoading(true);
    setError(null);
    try {
      const { name: rawName, description } = data as { name: string; description?: string | null };
      await onUpdate(folder.id, { name: rawName.trim(), description: description ?? folder.description });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("folders.editFolder")}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600">
            {error}
          </div>
        )}

        <FormField label={t("common.folderName")} error={errors.name?.message} required>
          <Input {...register("name")} />
        </FormField>

        <FormField label={t("common.description")} error={errors.description?.message}>
          <Input {...register("description")} />
        </FormField>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            icon={<Pencil className="h-4 w-4" />}
          >
            {t("common.save")}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
