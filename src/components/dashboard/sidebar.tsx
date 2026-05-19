"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  FolderOpen, 
  File, 
  Settings, 
  LogOut,
  Search,
  Home,
  Loader2
} from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslations } from "next-intl";
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

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
       <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              )}
            >
              <item.icon className="h-5 w-5" />
              {t(`sidebar.${item.key}`)}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const t = useTranslations();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });
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
      addToast({
        title: t("toast.error"),
        description: "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      disabled={isLoading}
      className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      onClick={handleLogout}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <LogOut className="h-5 w-5" />
      )}
      {t("common.signOut")}
    </button>
  );
}
