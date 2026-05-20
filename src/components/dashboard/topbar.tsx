"use client";

import { useAuth } from "@/components/providers/supabase-provider";
import { Avatar } from "@/components/ui/avatar";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  ChevronRight,
  Loader2,
  FileText,
  Folder as FolderIcon
} from "lucide-react";

interface ActivityRecord {
  id: string;
  name: string;
  type: "file" | "folder";
  created_at: string;
}

const PAGE_TITLES: Record<string, string> = {
  "/": "dashboard.title",
  "/files": "files.title",
  "/folders": "folders.title",
  "/search": "search.title",
  "/settings": "settings.title",
};

export function TopBar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const t = useTranslations();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch("/api/search?sort=created_at&order=desc");
      const json = await res.json();
      if (json.success) {
        // Merge and sort files and folders
        const files: ActivityRecord[] = json.data.files.map((f: any) => ({ ...f, type: "file" }));
        const folders: ActivityRecord[] = json.data.folders.map((f: any) => ({ ...f, type: "folder" }));
        const merged = [...files, ...folders].sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ).slice(0, 5); // top 5 recent activities
        
        setActivities(merged);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingActivities(false);
    }
  };

  const toggleNotifications = () => {
    if (!showNotifications) {
      fetchActivities();
    }
    setShowNotifications(!showNotifications);
  };

  if (loading) {
    return (
      <header className="h-16 px-8 flex items-center gap-3 border-b border-[var(--border)] glass z-10 sticky top-0">
        <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
        <span className="text-sm font-medium text-gray-500">{t("common.loading")}</span>
      </header>
    );
  }

  const matchKey = Object.entries(PAGE_TITLES).find(([path]) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  })?.[0] ?? "/";
  const pageTitleKey = PAGE_TITLES[matchKey] ?? "dashboard.title";
  const pageTitle = t(pageTitleKey);
  const fullName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "";

  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    let lastScroll = 0;
    const handleScroll = () => {
      const currentScroll = mainElement.scrollTop;
      if (currentScroll <= 10) {
        setVisible(true);
      } else if (currentScroll > lastScroll) {
        // Scrolling down -> hide
        setVisible(false);
      } else {
        // Scrolling up -> reveal
        setVisible(true);
      }
      lastScroll = currentScroll;
    };

    mainElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => mainElement.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSidebar = () => {
    setShowNotifications(false);
    document.documentElement.classList.toggle("sidebar-mobile-open");
  };

  return (
    <header className={`h-16 px-4 md:px-8 flex items-center justify-between border-b border-white/20 dark:border-white/10 glass z-40 sticky top-0 shadow-sm backdrop-blur-2xl transition-transform duration-300 ease-in-out ${visible ? "translate-y-0" : "-translate-y-full"}`}>
      {/* Breadcrumb & Mobile Menu Trigger */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={toggleMobileSidebar}
          className="md:hidden p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors mr-1 cursor-pointer"
          title="Toggle Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </button>
        <span className="text-gray-500 dark:text-gray-400 font-medium tracking-wide">Fyliolabs</span>
        {pathname !== "/" && (
          <>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-bold text-gray-900 dark:text-white tracking-wide">{pageTitle}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={toggleNotifications}
            className="relative p-2 text-gray-400 hover:text-primary-600 transition-colors"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-2 h-2 w-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 notification-dropdown">
              <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Recent Activity</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {loadingActivities ? (
                  <div className="p-6 flex justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                  </div>
                ) : activities.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-500">
                    No recent activity.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {activities.map((activity) => (
                      <div key={activity.id} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${activity.type === 'folder' ? 'bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10' : 'bg-green-50 text-green-500 dark:bg-green-500/10'}`}>
                          {activity.type === 'folder' ? <FolderIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
                            {activity.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {activity.type === 'folder' ? 'Folder created' : 'File uploaded'} &middot; {new Date(activity.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-gray-700 text-center">
                <a href="/search" className="text-xs font-medium text-primary-600 hover:text-primary-700 p-1">View all activity</a>
              </div>
            </div>
          )}
        </div>

        {fullName && (
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--border)] cursor-pointer group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight group-hover:text-primary-600 transition-colors">
                {fullName}
              </p>
              {user?.email && (
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                  {user.email}
                </p>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative rounded-full border-2 border-white dark:border-gray-800 shadow-sm">
                <Avatar
                  name={fullName}
                  size="sm"
                  url={
                    typeof user?.user_metadata?.avatar_url === "string"
                      ? user.user_metadata.avatar_url
                      : undefined
                  }
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
