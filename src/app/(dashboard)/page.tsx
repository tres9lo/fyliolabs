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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome header */}
      <div className="glass p-8 rounded-2xl border border-[var(--border)] relative overflow-hidden shadow-sm flex flex-col justify-center min-h-[160px]">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white font-display tracking-tight">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-lg max-w-xl">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          label={t("dashboard.totalFiles")}
          value={stats.totalFiles.toLocaleString()}
          description={t("dashboard.filesDesc")}
        />
        <StatCard
          label={t("dashboard.totalFolders")}
          value={stats.totalFolders.toLocaleString()}
          description={t("dashboard.foldersDesc")}
        />
        <StatCard
          label={t("dashboard.storageUsed")}
          value={stats.storageUsed}
          description={t("dashboard.storageDesc")}
        />
      </div>

      {/* Quick actions */}
      <div>
        <QuickActions />
      </div>

      {/* Recent files & folders */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
            <RecentFilesSection files={recentFiles} loading={false} />
          </div>
          <div className="glass rounded-2xl overflow-hidden border border-[var(--border)] shadow-sm">
            <RecentFoldersSection folders={recentFolders} loading={false} />
          </div>
        </div>
      )}

      {/* Storage breakdown */}
      {user && (
        <div className="mb-2 glass rounded-2xl border border-[var(--border)] shadow-sm p-2">
          <StorageDetail
            breakdown={stats.fileTypeBreakdown}
            total={stats.fileTypeBreakdown.reduce((s, e) => s + e.bytes, 0)}
          />
        </div>
      )}

      <Footer />
    </div>
  );
}

function StatCard({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl glass
      border-[var(--border)] shadow-sm p-8 group
      transition-all duration-300 hover:shadow-md hover:border-primary-500/50
    `}>
      <div className="relative z-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-4 text-4xl sm:text-5xl font-bold font-display text-gray-900 dark:text-white">{value}</p>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 font-medium">{description}</p>
      </div>
    </div>
  );
}
