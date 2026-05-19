"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Sun, Moon, Monitor, Palette, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";

type AccentColor = "blue" | "emerald" | "indigo" | "violet" | "rose" | "amber";

export function AppearanceSettings() {
  const t = useTranslations("settings");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [accent, setAccent] = useState<AccentColor>("blue");

  // Load theme and accent from local storage / document class on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
      if (savedTheme) setTheme(savedTheme);

      const savedAccent = localStorage.getItem("accent") as AccentColor | null;
      if (savedAccent) setAccent(savedAccent);
    }
  }, []);

  // Update theme helper
  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }

    toast.success(`Theme updated to ${newTheme}!`, {
      description: "Visual contrast and styles adjusted dynamically.",
    });
  };

const ACCENT_PALETTES = {
  blue: {
    50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa",
    500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a"
  },
  emerald: {
    50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399",
    500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b"
  },
  indigo: {
    50: "#e0e7ff", 100: "#c7d2fe", 200: "#a5b4fc", 300: "#818cf8", 400: "#6366f1",
    500: "#4f46e5", 600: "#4338ca", 700: "#3730a3", 800: "#312e81", 900: "#1e1b4b"
  },
  violet: {
    50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa",
    500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95"
  },
  rose: {
    50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185",
    500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337"
  },
  amber: {
    50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24",
    500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f"
  }
};

  // Update accent color helper
  const handleAccentChange = (newAccent: AccentColor) => {
    setAccent(newAccent);
    localStorage.setItem("accent", newAccent);

    // Apply primary color variable updates to root variables shade by shade
    const root = window.document.documentElement;
    const palette = ACCENT_PALETTES[newAccent];
    
    Object.entries(palette).forEach(([shade, hex]) => {
      root.style.setProperty(`--primary-${shade}`, hex);
    });

    toast.success(`Primary accent changed to ${newAccent}!`, {
      description: "App themes, loaders, and outlines refreshed.",
    });
  };

  const accents: { code: AccentColor; color: string; name: string }[] = [
    { code: "blue", color: "bg-blue-500", name: "Royal Blue" },
    { code: "emerald", color: "bg-emerald-500", name: "Emerald Green" },
    { code: "indigo", color: "bg-indigo-500", name: "Indigo Purple" },
    { code: "violet", color: "bg-violet-500", name: "Violet Orchid" },
    { code: "rose", color: "bg-rose-500", name: "Rose Velvet" },
    { code: "amber", color: "bg-amber-500", name: "Amber Sun" },
  ];

  return (
    <div className="glass p-8 rounded-2xl border border-[var(--border)] shadow-sm space-y-6">
      {/* Ribbon Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]">
        <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <Palette className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
            Appearance Customizer
          </h3>
          <p className="text-xs text-gray-500">Configure theme overrides and accent palettes</p>
        </div>
      </div>

      {/* Theme Cards Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">UI Mode</span>
        <div className="grid grid-cols-3 gap-3">
          {/* Light Theme Card */}
          <button
            onClick={() => handleThemeChange("light")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
              theme === "light"
                ? "border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-600 dark:text-primary-400 font-semibold"
                : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-gray-300 dark:hover:border-gray-700 text-gray-500"
            }`}
          >
            <Sun className="h-5 w-5" />
            <span className="text-xs">Light</span>
          </button>

          {/* Dark Theme Card */}
          <button
            onClick={() => handleThemeChange("dark")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
              theme === "dark"
                ? "border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-600 dark:text-primary-400 font-semibold"
                : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-gray-300 dark:hover:border-gray-700 text-gray-500"
            }`}
          >
            <Moon className="h-5 w-5" />
            <span className="text-xs">Dark</span>
          </button>

          {/* System Theme Card */}
          <button
            onClick={() => handleThemeChange("system")}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all cursor-pointer ${
              theme === "system"
                ? "border-primary-500 bg-primary-50/30 dark:bg-primary-950/10 text-primary-600 dark:text-primary-400 font-semibold"
                : "border-[var(--border)] bg-[var(--surface-muted)] hover:border-gray-300 dark:hover:border-gray-700 text-gray-500"
            }`}
          >
            <Monitor className="h-5 w-5" />
            <span className="text-xs">System</span>
          </button>
        </div>
      </div>

      {/* Accent color selectors */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-gray-400 tracking-wider">Primary Accent</span>
          <span className="text-[10px] bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded text-amber-600 dark:text-amber-400 font-bold uppercase flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Live styling
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2">
          {accents.map((acc) => (
            <button
              key={acc.code}
              onClick={() => handleAccentChange(acc.code)}
              className={`h-10 w-full rounded-xl flex items-center justify-center text-white cursor-pointer relative shadow-sm hover:scale-105 transition-transform ${acc.color}`}
              title={acc.name}
            >
              {accent === acc.code && (
                <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center">
                  <Check className="h-5 w-5 stroke-[3px]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
