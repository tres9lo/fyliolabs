"use client";

import { Sidebar } from "@/components/dashboard/sidebar";
import { TopBar } from "@/components/dashboard/topbar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // Close mobile sidebar overlay automatically on route navigation
  useEffect(() => {
    document.documentElement.classList.remove("sidebar-mobile-open");
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <main
          className={cn(
            "flex-1 overflow-y-auto",
            "p-4 sm:p-6"
          )}
        >
          <div className="max-w-[1400px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
