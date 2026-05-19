"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { X, Save, Trash2, ExternalLink, Image as ImageIcon, Film, Music, FileText, Download, FolderOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatFileSize, getCloudinaryDownloadUrl } from "@/lib/utils";
import { useTranslations } from "next-intl";
import type { FileRecord } from "@/types/file";
import type { Folder } from "@/types/folder";
import { toast } from "sonner";

interface FolderOption { id: string; name: string; }

interface FileDetailPanelProps {
  file: FileRecord | null;
  onClose: () => void;
  onUpdate: (updated: FileRecord) => void;
  onDelete: (id: string) => void;
  onConvert?: (newFile: FileRecord) => void;
}

async function fetchFolders(): Promise<FolderOption[]> {
  const res = await fetch("/api/folders");
  const json = await res.json();
  if (json.success) return json.data as FolderOption[];
  return [];
}

export function FileDetailPanel({ file, onClose, onUpdate, onDelete, onConvert }: FileDetailPanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [displayName, setDisplayName] = useState(file?.display_name ?? "");
  const [description, setDescription] = useState(file?.description || "");
  const [isPublic, setIsPublic] = useState(file?.is_public ?? false);
  const [error, setError] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [convertFormat, setConvertFormat] = useState("");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [moving, setMoving] = useState(false);

  // Text Editor state
  const [textContent, setTextContent] = useState<string | null>(null);
  const [originalTextContent, setOriginalTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const [savingText, setSavingText] = useState(false);

  const t = useTranslations("fileDetail");
  const tCommon = useTranslations("common");

  const isEditableTextFile = useCallback((fileRecord: FileRecord) => {
    const editableExtensions = ["txt", "md", "json", "csv", "js", "ts", "tsx", "html", "css", "xml", "py", "sh"];
    const ext = fileRecord.name.split('.').pop()?.toLowerCase() || "";
    return fileRecord.mime_type.startsWith("text/") || editableExtensions.includes(ext);
  }, []);

  useEffect(() => {
    if (file && isEditableTextFile(file)) {
      setLoadingText(true);
      setTextContent(null);
      setOriginalTextContent(null);
      setError(null);
      fetch(file.cloudinary_url)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load content");
          return res.text();
        })
        .then((text) => {
          setTextContent(text);
          setOriginalTextContent(text);
        })
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : "Error fetching text file");
        })
        .finally(() => {
          setLoadingText(false);
        });
    }
  }, [file, isEditableTextFile]);

  const handleSaveTextContent = async () => {
    if (!file || textContent === null) return;
    setSavingText(true);
    setError(null);
    try {
      const res = await fetch(`/api/files/${file.id}/content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: textContent }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setOriginalTextContent(textContent);
        onUpdate(json.data);
        toast.success(tCommon("success"), { description: "File content updated successfully" });
      } else {
        setError(json.error || "Failed to save file content");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving text file");
    } finally {
      setSavingText(false);
    }
  };

  useEffect(() => {
    void fetchFolders().then(setFolders);
  }, []);

  useEffect(() => {
    if (file) {
      setDisplayName(file.display_name);
      setDescription(file.description || "");
      setIsPublic(file.is_public);
      setError(null);
      setConverting(false);
      setSelectedFolder(file.folder_id);
      if (availableFormats.length > 0) {
        const currentExt = file.name.split('.').pop()?.toLowerCase() || "";
        const defaultFormat = availableFormats.includes(currentExt) && currentExt !== file.cloudinary_format
          ? currentExt
          : availableFormats[0];
        setConvertFormat(defaultFormat);
      }
    }
  }, [file]);

  const handleMoveToFolder = useCallback(async () => {
    if (!file) return;
    setMoving(true);
    setError(null);
    try {
      const res = await fetch(`/api/files/${file.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: selectedFolder }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        onUpdate(json.data);
        toast.success(tCommon("success"), { description: t("movedToFolder") });
      } else {
        setError(json.error || "Failed to move file");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Move error");
    } finally {
      setMoving(false);
    }
  }, [file, selectedFolder, onUpdate, tCommon, t]);

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
          folder_id: selectedFolder,
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
    if (!confirm(tCommon("deleteConfirm", { name: file.name }))) return;
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
          <div className="flex justify-center bg-[var(--surface-muted)] rounded-2xl p-6 border border-[var(--border)] overflow-hidden">
            {file.file_type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${file.cloudinary_url}?w=800&h=800&crop=limit`}
                alt={file.display_name}
                className="max-h-64 max-w-full object-contain rounded-lg shadow-sm"
              />
            ) : file.file_type === "video" ? (
              <video
                src={file.cloudinary_url}
                controls
                className="max-h-64 max-w-full rounded-lg shadow-sm"
                poster={file.cloudinary_url.replace(/\.[^/.]+$/, ".jpg")}
              >
                Your browser does not support the video tag.
              </video>
            ) : file.file_type === "audio" ? (
              <div className="w-full flex flex-col items-center justify-center gap-6 py-4">
                <div className="p-4 bg-pink-100 dark:bg-pink-900/30 rounded-full shadow-inner border border-pink-200 dark:border-pink-800">
                  <Music className="h-12 w-12 text-pink-500 dark:text-pink-400" />
                </div>
                <audio
                  src={file.cloudinary_url}
                  controls
                  className="w-full max-w-md rounded-full shadow-sm"
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : isEditableTextFile(file) ? (
              <div className="w-full flex flex-col h-72 rounded-xl overflow-hidden bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <span className="text-[10px] font-bold text-gray-450 uppercase tracking-wider">Editor</span>
                  {textContent !== originalTextContent && (
                    <Button
                      size="sm"
                      onClick={handleSaveTextContent}
                      isLoading={savingText}
                      icon={<Save className="h-3.5 w-3.5" />}
                    >
                      Save Changes
                    </Button>
                  )}
                </div>
                {loadingText ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  </div>
                ) : (
                  <textarea
                    value={textContent || ""}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="flex-1 w-full p-3 font-mono text-xs bg-transparent border-none outline-none resize-none text-gray-850 dark:text-gray-200 focus:ring-0 leading-relaxed"
                    placeholder="Empty file. Type here..."
                  />
                )}
              </div>
            ) : (
              <div className="py-8">
                {getFileIcon()}
              </div>
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

            {/* Move to folder */}
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="h-3.5 w-3.5" />
                    {t("moveToFolder")}
                  </span>
                </label>
                <select
                  value={selectedFolder ?? ""}
                  onChange={(e) => setSelectedFolder(e.target.value === "" ? null : e.target.value)}
                  className="w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">{tCommon("noFolder")}</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <Button size="sm" onClick={handleMoveToFolder} isLoading={moving} icon={<FolderOpen className="h-4 w-4" />}>
                {t("moveToFolder")}
              </Button>
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
          <a
            href={getCloudinaryDownloadUrl(file.cloudinary_url, file.name)}
            download={file.name}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-[var(--border)] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
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
