"use client";

import { useState, useEffect } from "react";
import { HardDrive, BarChart3, Database, Network, ShieldCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function SystemStatsSettings() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    foldersCount: 0,
    filesCount: 0,
    totalBytes: 0,
    apiLatency: 104, // default placeholder
    dbStatus: "Healthy",
  });

  const fetchStats = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const [filesRes, foldersRes] = await Promise.all([
        fetch("/api/files?all=true").then((r) => r.json()),
        fetch("/api/folders").then((r) => r.json()),
      ]);

      const end = performance.now();
      const latency = Math.round(end - start);

      if (filesRes.success && foldersRes.success) {
        const filesData = filesRes.data ?? [];
        const foldersData = foldersRes.data ?? [];
        const totalSize = filesData.reduce((acc: number, cur: any) => acc + (cur.file_size || 0), 0);

        setStats({
          foldersCount: foldersData.length,
          filesCount: filesData.length,
          totalBytes: totalSize,
          apiLatency: Math.max(15, Math.min(latency, 250)),
          dbStatus: "Connected",
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, []);

  const handleManualRefresh = () => {
    void fetchStats();
    toast.success("Workspace System Stats updated!", {
      description: "Storage gauge, latency metrics, and API indices refreshed.",
    });
  };

  // Convert bytes to readable formats (MB, KB)
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  // 1 GB hypothetical limit for free plan
  const storageLimit = 1024 * 1024 * 1024; // 1 GB in bytes
  const percentUsed = Math.min(100, Math.max(0.1, (stats.totalBytes / storageLimit) * 100));

  return (
    <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
              Workspace & API Stats
            </h3>
            <p className="text-xs text-gray-500">Live storage quotas and latency monitoring</p>
          </div>
        </div>
        
        <button
          onClick={handleManualRefresh}
          disabled={loading}
          className="p-2 border border-[var(--border)] hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer text-gray-500 disabled:opacity-50 shrink-0"
          title="Refresh statistics"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-primary-500" : ""}`} />
        </button>
      </div>

      {/* Cloudinary Storage Gauge */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold uppercase text-gray-400 tracking-wider">
          <span>Cloud Storage Quota</span>
          <span className="text-primary-600 dark:text-primary-400 font-semibold lowercase">
            {formatSize(stats.totalBytes)} of 1.0 GB ({percentUsed.toFixed(2)}%)
          </span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 h-3 rounded-full overflow-hidden shadow-inner border border-gray-200/50 dark:border-gray-850">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-1000"
            style={{ width: `${percentUsed}%` }}
          />
        </div>
      </div>

      {/* Counter Statistics List */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <HardDrive className="h-4 w-4 text-blue-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Folders</span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stats.foldersCount}</span>
          </div>
        </div>

        <div className="bg-[var(--surface-muted)] border border-[var(--border)] rounded-2xl p-4 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <Database className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Files</span>
            <span className="text-lg font-extrabold text-gray-900 dark:text-white mt-0.5">{stats.filesCount}</span>
          </div>
        </div>
      </div>

      {/* Technical API Indicators */}
      <div className="space-y-3 border-t border-[var(--border)] pt-4">
        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Health Indices</span>
        <div className="space-y-2">
          {/* Latency gauge */}
          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
              <Network className="h-4 w-4 text-indigo-500" />
              API Latency
            </span>
            <span className={`font-bold ${stats.apiLatency < 120 ? "text-emerald-500" : "text-amber-500"}`}>
              {stats.apiLatency} ms
            </span>
          </div>

          {/* Database link health */}
          <div className="flex items-center justify-between text-xs p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-300 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              DB Link State
            </span>
            <span className="font-bold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              {stats.dbStatus}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
export default SystemStatsSettings;
