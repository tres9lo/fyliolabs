import { getTranslator } from "next-intl/server";

export const metadata = {
  title: "Dashboard - Fyliolabs",
  description: "Manage your files and folders",
};

export default async function DashboardPage() {
  const t = await getTranslator();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("dashboard.title")}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {t("dashboard.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* <StatsCard title={t("dashboard.totalFiles") value="0" />
        <StatsCard title={t("dashboard.totalFolders") value="0" />
        <StatsCard title={t("dashboard.storageUsed") value="0 GB" /> */}
      </div>

      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t("dashboard.quickStart")}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t("dashboard.getStarted")}
        </p>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("dashboard.step1")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("dashboard.step1Desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("dashboard.step2")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("dashboard.step2Desc")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {t("dashboard.step3")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t("dashboard.step3Desc")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
