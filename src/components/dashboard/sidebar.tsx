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
  X,
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Logo from "@/components/ui/logo";

const navigation = [
  { key: "dashboard", href: "/", icon: Home },
  { key: "files", href: "/files", icon: File },
  { key: "folders", href: "/folders", icon: FolderOpen },
  { key: "search", href: "/search", icon: Search },
  { key: "settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex-shrink-0 flex flex-col border-r",
        "bg-[var(--surface)] border-[var(--border)]",
        "transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      {/* Logo region */}
      <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
        {!collapsed && (
          <Link href="/" className="flex items-center">
            <Logo />
          </Link>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="p-1.5 rounded-lg text-gray-500 hover:bg-[var(--surface-muted)] hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors ml-auto"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              title={collapsed ? t(`sidebar.${item.key}`) : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                collapsed ? "justify-center" : "",
                isActive
                  ? "bg-primary-500 text-white shadow-md shadow-primary-500/25"
                  : "text-gray-600 dark:text-gray-300 hover:bg-[var(--surface-muted)] hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px] flex-shrink-0" />
              {!collapsed && <span>{t(`sidebar.${item.key}`)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
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
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
        "text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:text-gray-400",
        collapsed ? "justify-center" : ""
      )}
    >
      {isLoading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <LogOut className="h-[18px] w-[18px]" />
      )}
      {!collapsed && <span>{t("common.signOut")}</span>}
    </button>
  );
}
