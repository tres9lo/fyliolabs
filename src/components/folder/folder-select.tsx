"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

interface FolderOption {
  id: string;
  name: string;
}

export function FolderSelect({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations();

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const res = await fetch("/api/folders");
        const json = await res.json();
        if (json.success) {
          setFolders(json.data);
        }
      } catch (error) {
        console.error("Failed to fetch folders", error);
      } finally {
        setLoading(false);
      }
    };
    loadFolders();
  }, []);

  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value === "" ? null : e.target.value)}
      className="w-full max-w-xs rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
      disabled={loading}
    >
      <option value="">{t("common.noFolder")}</option>
      {folders.map((folder) => (
        <option key={folder.id} value={folder.id}>
          {folder.name}
        </option>
      ))}
    </select>
  );
}
