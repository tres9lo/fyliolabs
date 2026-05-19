import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function formatFileType(fileType: string): string {
  return fileType.charAt(0).toUpperCase() + fileType.slice(1);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getCloudinaryDownloadUrl(url: string, filename?: string): string {
  if (!url.includes("cloudinary.com")) return url;
  
  // Example Cloudinary URL: https://res.cloudinary.com/demo/image/upload/v12345/file.png
  // To force download: insert fl_attachment before the version/folder path.
  // We can just replace '/upload/' with `/upload/fl_attachment${filename ? `:${encodeURIComponent(filename)}` : ''}/`
  const attachmentStr = filename ? `fl_attachment:${encodeURIComponent(filename)}` : 'fl_attachment';
  return url.replace('/upload/', `/upload/${attachmentStr}/`);
}
