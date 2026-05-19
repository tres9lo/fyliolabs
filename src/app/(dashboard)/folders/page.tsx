import { getFolderTree } from "@/lib/folder-service";
import { FolderManager } from "@/components/folder/folder-manager";
import { getTranslations } from "next-intl/server";

export const metadata = {
  title: "Folders - Fyliolabs",
  description: "Organize your files into nested folders",
};

export default async function FoldersPage() {
  const initialFolders = await getFolderTree();
  const t = await getTranslations();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("folders.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("folders.subtitle")}
        </p>
      </div>

      <FolderManager initialFolders={initialFolders} />
    </div>
  );
}
