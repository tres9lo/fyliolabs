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
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-display">
          {t("dashboard.welcome")}
        </h1>
        <p className="mt-1.5 text-gray-600 dark:text-gray-400 text-sm">
          {t("dashboard.subtitle")}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard
          label={t("dashboard.totalFiles")}
          value={stats.totalFiles.toLocaleString()}
          description={t("dashboard.filesDesc")}
          accent="primary"
        />
        <StatCard
          label={t("dashboard.totalFolders")}
          value={stats.totalFolders.toLocaleString()}
          description={t("dashboard.foldersDesc")}
          accent="accent"
        />
        <StatCard
          label={t("dashboard.storageUsed")}
          value={stats.storageUsed}
          description={t("dashboard.storageDesc")}
          accent="primary"
        />
      </div>

      {/* Quick actions */}
      <div>
        <QuickActions />
      </div>

      {/* Recent files & folders */}
      {user && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentFilesSection files={recentFiles} loading={false} />
          <RecentFoldersSection folders={recentFolders} loading={false} />
        </div>
      )}

      {/* Storage breakdown */}
      {user && (
        <div className="mb-2">
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

function StatCard({ label, value, description, accent }: { label: string; value: string; description: string; accent: "primary" | "accent" }) {
  const accentGrad = accent === "primary"
    ? "from-primary-500/12 to-primary-500/4"
    : "from-accent-500/12 to-accent-500/4";
  const accentBorder = accent === "primary"
    ? "border-primary-500/30"
    : "border-accent-500/30";
  return (
    <div className={`
      relative overflow-hidden rounded-2xl border bg-[var(--surface)]
      border-[var(--border)] shadow-sm p-6 group
      transition-shadow duration-200 hover:shadow-md
      after:content-[''] after:absolute after:inset-0
      after:bg-gradient-to-br ${accentGrad} after:opacity-100
      after:pointer-events-none
    `}>
      <div className="relative z-10">
        <p className="text-sm font-medium text-[var(--foreground)]/60">{label}</p>
        <p className="mt-3 text-4xl font-bold text-[var(--foreground)]">{value}</p>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
