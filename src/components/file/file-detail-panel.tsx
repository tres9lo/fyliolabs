"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Save, Trash2, ExternalLink, Image as ImageIcon, Film, Music, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { FileRecord } from "@/types/file";

interface FileDetailPanelProps {
  file: FileRecord | null;
  onClose: () => void;
  onUpdate: (updated: FileRecord) => void;
  onDelete: (id: string) => void;
  onConvert?: (newFile: FileRecord) => void;
}

export function FileDetailPanel({ file, onClose, onUpdate, onDelete, onConvert }: FileDetailPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(file?.display_name ?? "");
  const [description, setDescription] = useState(file?.description || "");
  const [isPublic, setIsPublic] = useState(file?.is_public ?? false);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertFormat, setConvertFormat] = useState("");

  const t = useTranslations("fileDetail");
  const tCommon = useTranslations("common");

  const conversionFormats = useMemo(() => ({
    image: ["jpg", "png", "webp", "avif", "gif"],
    video: ["mp4", "webm"],
    audio: ["mp3", "wav", "ogg"],
  }), []);

  const availableFormats = useMemo(() =>
    file?.file_type && file.file_type in conversionFormats
      ? conversionFormats[file.file_type as keyof typeof conversionFormats] || []
      : [],
    [file?.file_type, conversionFormats]
  );

  useEffect(() => {
    if (file) {
      setDisplayName(file.display_name);
      setDescription(file.description || "");
      setIsPublic(file.is_public);
      setError(null);
      setConverting(false);
      if (availableFormats.length > 0) {
        const currentExt = file.name.split('.').pop()?.toLowerCase() || "";
        const defaultFormat = availableFormats.includes(currentExt) && currentExt !== file.cloudinary_format
          ? currentExt
          : availableFormats[0];
        setConvertFormat(defaultFormat);
      }
    }
  }, [file, availableFormats]);

  if (!file) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          description: description,
          is_public: isPublic,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        onUpdate(json.data);
      } else {
        setError(json.error || "Failed to save");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t("common.deleteConfirm", { name: file.name }))) return;
    try {
      const res = await fetch(`/api/files/${file.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        onDelete(file.id);
        onClose();
      } else {
        setError(json.error || "Delete failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete error");
    }
  };

  const handleConvert = async () => {
    if (!convertFormat) return;
    setConverting(true);
    setError(null);
    try {
      const res = await fetch(`/api/files/${file.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: convertFormat }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        onConvert?.(json.data);
      } else {
        setError(json.error || "Conversion failed");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Conversion error");
    } finally {
      setConverting(false);
    }
  };

  const getFileIcon = () => {
    switch (file.file_type) {
      case "image":
        return <ImageIcon className="h-16 w-16 text-green-500" />;
      case "video":
        return <Film className="h-16 w-16 text-purple-500" />;
      case "audio":
        return <Music className="h-16 w-16 text-pink-500" />;
      default:
        return <FileText className="h-16 w-16 text-gray-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white dark:bg-gray-800 shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Preview */}
          <div className="flex justify-center bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
            {file.file_type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${file.cloudinary_url}?w=400&h=400&crop=thumb`}
                alt={file.display_name}
                className="max-h-48 max-w-full object-contain"
              />
            ) : (
              getFileIcon()
            )}
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tCommon("name")}
              </label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={tCommon("name")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {tCommon("description")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={tCommon("description")}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t("public")}
              </label>
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? "bg-primary-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Metadata (readonly) */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("metadata")}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("size")}</span>
                <p>{formatFileSize(file.file_size)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("type")}</span>
                <p className="capitalize">{file.file_type}</p>
              </div>
              {file.cloudinary_width && file.cloudinary_height && (
                <div>
                  <span className="text-gray-500 dark:text-gray-400">{t("dimensions")}</span>
                  <p>{file.cloudinary_width} × {file.cloudinary_height}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("mime")}</span>
                <p className="truncate">{file.mime_type}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t("created")}</span>
                <p>{new Date(file.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Cloudinary URL */}
            {file.file_type === "image" && (
              <a
                href={file.cloudinary_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
              >
                {t("viewOriginal")} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {/* Conversion Section */}
          {availableFormats.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                {t("conversion")}
              </h3>
              <div className="flex items-center gap-2">
                <select
                  value={convertFormat}
                  onChange={(e) => setConvertFormat(e.target.value)}
                  className="rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                >
                  {availableFormats.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </select>
                <Button
                  size="sm"
                  onClick={handleConvert}
                  isLoading={converting}
                  icon={<Download className="h-4 w-4" />}
                >
                  {t("convertFile")}
                </Button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="h-4 w-4" />}>
            {tCommon("delete")}
          </Button>
          <div className="flex-1" />
          <Button variant="secondary" onClick={onClose}>
            {tCommon("cancel")}
          </Button>
          <Button onClick={handleSave} isLoading={isSaving} icon={<Save className="h-4 w-4" />}>
            {tCommon("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
