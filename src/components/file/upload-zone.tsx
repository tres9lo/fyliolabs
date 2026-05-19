"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/providers/toast-provider";
import type { FileRecord } from "@/types/file";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export function UploadZone({ onUploadSuccess, selectedFolder }: { onUploadSuccess?: (file: FileRecord) => void; selectedFolder?: string | null }) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const t = useTranslations();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsLoading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (selectedFolder) {
          formData.append("folder_id", selectedFolder);
        }

        const response = await fetch("/api/files/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
          addToast({
            title: t("toast.success"),
            description: `${t("toast.uploaded")} ${file.name}`,
            variant: "success",
          });
          onUploadSuccess?.(result.data);
        } else {
          addToast({
            title: t("toast.error"),
            description: result.error || "An error occurred during upload",
            variant: "destructive",
          });
        }
      } catch (err: unknown) {
        addToast({
          title: t("toast.error"),
          description: err instanceof Error ? err.message : "Upload error",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [addToast, onUploadSuccess, selectedFolder, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"],
      "video/*": [".mp4", ".webm", ".mov", ".avi", ".flv"],
      "audio/*": [".mp3", ".wav", ".ogg", ".aac", ".flac"],
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "text/plain": [".txt"],
    },
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
        ${isDragActive
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
          : "border-gray-300 hover:border-primary-400 dark:border-gray-600 dark:hover:border-primary-500"
        }
        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-3">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
          {isLoading ? (
            <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>
        {isLoading ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {t("common.loading")}...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isDragActive ? t("files.uploadZonePrompt") : t("files.uploadZonePrompt")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("files.uploadZoneLimit")}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
