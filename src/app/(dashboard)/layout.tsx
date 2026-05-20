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

  // Click outside to close mobile sidebar
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (document.documentElement.classList.contains("sidebar-mobile-open")) {
        if (!target.closest("aside") && !target.closest("button[title='Toggle Menu']")) {
          document.documentElement.classList.remove("sidebar-mobile-open");
        }
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] flex relative">
      {/* Mobile Drawer dim backdrop overlay */}
      <div 
        onClick={() => document.documentElement.classList.remove("sidebar-mobile-open")}
        className="fixed inset-0 bg-black/35 backdrop-blur-[3px] z-[99998] pointer-events-none opacity-0 transition-opacity duration-300 md:hidden sidebar-mobile-overlay"
      />

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
