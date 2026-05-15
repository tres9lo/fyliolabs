"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: { id: string; name: string };
  onDelete: (id: string) => Promise<void>;
}

export function DeleteFolderModal({
  isOpen,
  onClose,
  folder,
  onDelete,
}: DeleteFolderModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations();

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(folder.id);
    } catch {
      // error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("folders.deleteFolder")}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900 dark:text-red-100">
              {t("folders.deleteFolder")}
            </h4>
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
              {t("folders.deleteConfirm", { name: folder.name })}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={isLoading}>
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            isLoading={isLoading}
            icon={<Trash2 className="h-4 w-4" />}
          >
            {t("common.delete")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
