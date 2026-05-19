import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { createSupabaseServerClient } from "@/lib/server-supabase";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { getRecentFiles, getRecentFolders } from "@/lib/dashboard-service";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentFilesSection } from "@/components/dashboard/recent-files";
import { RecentFoldersSection } from "@/components/dashboard/recent-folders";
import { StorageDetail } from "@/components/dashboard/storage-detail";
import { Footer } from "@/components/dashboard/footer";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";

export const metadata = {
  title: "Dashboard - Fyliolabs",
  description: "Manage your files and folders",
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const t = await getTranslations();

  let stats = { totalFiles: 0, totalFolders: 0, storageUsed: "0 MB", fileTypeBreakdown: [] as { type: string; label: string; bytes: number }[] };
  let recentFiles: Awaited<ReturnType<typeof getRecentFiles>> = [];
  let recentFolders: Awaited<ReturnType<typeof getRecentFolders>> = [];
  if (user) {
    const [rawStats, rf, rfo] = await Promise.all([
      getDashboardStats(supabase, user.id),
      getRecentFiles(supabase, user.id, 5),
      getRecentFolders(supabase, user.id, 5),
    ]);
    stats = rawStats;
    recentFiles = rf;
    recentFolders = rfo;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t("dashboard.welcome", { default: "Welcome back" })}
              </h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {t("dashboard.subtitle")}
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                label={t("dashboard.totalFiles")}
                value={stats.totalFiles.toLocaleString()}
                description={t("dashboard.filesDesc", { default: "All files uploaded" })}
              />
              <StatCard
                label={t("dashboard.totalFolders")}
                value={stats.totalFolders.toLocaleString()}
                description={t("dashboard.foldersDesc", { default: "Nested folders created" })}
              />
              <StatCard
                label={t("dashboard.storageUsed")}
                value={stats.storageUsed}
                description={t("dashboard.storageDesc", { default: "Across all files" })}
              />
            </div>

            {/* Quick actions */}
            <div className="mb-8">
              <QuickActions />
            </div>

            {/* Recent files & folders — two-column grid */}
            {user && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RecentFilesSection files={recentFiles} loading={false} />
                <RecentFoldersSection folders={recentFolders} loading={false} />
              </div>
            )}

            {/* Storage detail breakdown */}
            {user && (
              <div className="mb-8">
                <StorageDetail
                  breakdown={stats.fileTypeBreakdown}
                  total={stats.fileTypeBreakdown.reduce((sum, e) => sum + e.bytes, 0)}
                />
              </div>
            )}

            {/* Footer */}
            <Footer />
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────

function StatCard(props: { label: string; value: string; description: string }) {
  const { label, value, description } = props;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
      <p className="mt-2 text-4xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
