"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  FolderOpen,
  File,
  Settings,
  LogOut,
  Search,
  Home,
  Loader2,
  ChevronLeft,
  Menu,
  Code,
  Info,
  Mail,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Logo from "@/components/ui/logo";

const navigation = [
  { key: "dashboard", href: "/", icon: Home },
  { key: "files", href: "/files", icon: File },
  { key: "folders", href: "/folders", icon: FolderOpen },
  { key: "editor", href: "/editor", icon: Code },
  { key: "search", href: "/search", icon: Search },
  { key: "about", href: "/about", icon: Info },
  { key: "contact", href: "/contact", icon: Mail },
  { key: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "dashboard-sidebar flex-shrink-0 flex flex-col border-r border-white/20 dark:border-white/10 z-20",
        "glass shadow-sm backdrop-blur-2xl",
        "transition-all duration-300",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo region */}
      <div className="p-5 border-b border-[var(--border)] flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center transition-transform hover:scale-105">
            <Logo />
          </Link>
        )}
        
        {/* Mobile Close Button (explicit hide button) */}
        <button
          onClick={() => document.documentElement.classList.remove("sidebar-mobile-open")}
          className="md:hidden p-1.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-500 transition-colors cursor-pointer"
          title="Close Menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5">
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        </button>

        <button
          onClick={() => setCollapsed((p) => !p)}
          className="hidden md:inline-flex p-1.5 rounded-xl text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all hover:shadow-sm ml-auto"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? t(`sidebar.${item.key}`) : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/25 scale-[1.02]"
                  : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-primary-600 dark:hover:text-primary-400"
              )}
            >
              <item.icon className={cn(
                "h-[20px] w-[20px] flex-shrink-0 transition-transform duration-300",
                isActive ? "" : "group-hover:scale-110"
              )} />
              {!collapsed && <span>{t(`sidebar.${item.key}`)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <LogoutButton collapsed={collapsed} />
      </div>
    </aside>
  );
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const t = useTranslations();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        router.push("/login");
        router.refresh();
      } else {
        addToast({
          title: t("toast.error"),
          description: "Failed to logout",
          variant: "destructive",
        });
      }
    } catch {
      addToast({ title: t("toast.error"), description: "Failed to logout", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      disabled={isLoading}
      onClick={handleLogout}
      title={collapsed ? t("common.signOut") : undefined}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-300 group",
        "text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 hover:shadow-sm",
        collapsed ? "justify-center" : ""
      )}
    >
      {isLoading ? (
        <Loader2 className="h-[20px] w-[20px] animate-spin" />
      ) : (
        <LogOut className="h-[20px] w-[20px] group-hover:scale-110 transition-transform duration-300" />
      )}
      {!collapsed && <span>{t("common.signOut")}</span>}
    </button>
  );
}
