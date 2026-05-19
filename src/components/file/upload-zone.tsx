"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useToast } from "@/components/providers/toast-provider";
import type { FileRecord } from "@/types/file";
import { formatFileSize } from "@/lib/utils";

const MAX_SIZE = 100 * 1024 * 1024; // 100MB

export function UploadZone({ onUploadSuccess, selectedFolder }: { onUploadSuccess?: (file: FileRecord) => void; selectedFolder?: string | null }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(0); // bytes per second
  const [remainingTime, setRemainingTime] = useState<number | null>(null); // seconds
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  
  const { addToast } = useToast();
  const t = useTranslations();

  // Disturbance Prevention: Warn before leaving page during upload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isUploading || isProcessing) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUploading, isProcessing]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setIsUploading(true);
      setIsProcessing(false);
      setProgress(0);
      setSpeed(0);
      setRemainingTime(null);
      setUploadedBytes(0);
      setTotalBytes(file.size);

      const formData = new FormData();
      formData.append("file", file);
      if (selectedFolder) {
        formData.append("folder_id", selectedFolder);
      }

      const startTime = Date.now();
      let lastLoaded = 0;
      let lastTime = startTime;

      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/files/upload", true);

      // Track progress
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
          setUploadedBytes(e.loaded);

          const currentTime = Date.now();
          const timeElapsed = (currentTime - lastTime) / 1000; // seconds

          if (timeElapsed > 0.5) { // update speed every 500ms to avoid jitter
            const bytesSinceLast = e.loaded - lastLoaded;
            const currentSpeed = bytesSinceLast / timeElapsed; // bytes per second
            setSpeed(currentSpeed);

            if (currentSpeed > 0) {
              const remainingBytes = e.total - e.loaded;
              setRemainingTime(remainingBytes / currentSpeed);
            }

            lastLoaded = e.loaded;
            lastTime = currentTime;
          }

          if (percentComplete === 100) {
            setIsUploading(false);
            setIsProcessing(true); // Now the server is processing the Cloudinary upload
          }
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        setIsProcessing(false);
        
        try {
          const result = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && result.success) {
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
        } catch (err) {
          addToast({
            title: t("toast.error"),
            description: "Invalid server response",
            variant: "destructive",
          });
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setIsProcessing(false);
        addToast({
          title: t("toast.error"),
          description: "Network error occurred",
          variant: "destructive",
        });
      };

      xhr.send(formData);
    },
    [addToast, onUploadSuccess, selectedFolder, t]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".svg"],
      "video/*": [".mp4", ".webm", ".mov", ".avi", ".flv", ".mkv"],
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
    disabled: isUploading || isProcessing, // Disable dropzone during upload
  });

  const formatSpeed = (bytesPerSec: number) => {
    if (bytesPerSec === 0) return "0 B/s";
    const k = 1024;
    const sizes = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
    return parseFloat((bytesPerSec / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds <= 0) return "Estimating...";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    if (m > 0) return `${m}m ${s}s left`;
    return `${s}s left`;
  };

  return (
    <div
      {...getRootProps()}
      className={`
        relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all overflow-hidden
        ${isDragActive
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-inner"
          : "border-[var(--border)] hover:border-primary-400 bg-[var(--surface-muted)] dark:hover:border-primary-500"
        }
        ${(isUploading || isProcessing) ? "pointer-events-none" : ""}
      `}
    >
      <input {...getInputProps()} />
      
      {isUploading || isProcessing ? (
        <div className="flex flex-col items-center max-w-md mx-auto w-full z-10 relative">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {isProcessing ? "Processing File..." : `Uploading... ${progress}%`}
            </span>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {formatFileSize(uploadedBytes)} / {formatFileSize(totalBytes)}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-3 overflow-hidden">
            <div 
              className={`bg-primary-600 h-2.5 rounded-full transition-all duration-300 ${isProcessing ? "w-full animate-pulse" : ""}`}
              style={{ width: isProcessing ? "100%" : `${progress}%` }}
            ></div>
          </div>

          {!isProcessing && (
            <div className="flex justify-between w-full text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>{formatSpeed(speed)}</span>
              <span>{remainingTime ? formatTime(remainingTime) : "Estimating..."}</span>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-lg">
            <AlertCircle className="h-3.5 w-3.5" />
            Please do not close this page until the upload finishes.
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div className="p-4 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-[var(--border)]">
            <Upload className="h-7 w-7 text-primary-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {isDragActive ? "Drop the file here" : t("files.uploadZonePrompt")}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("files.uploadZoneLimit")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
