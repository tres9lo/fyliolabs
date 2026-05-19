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

  // Update accent color helper
  const handleAccentChange = (newAccent: AccentColor) => {
    setAccent(newAccent);
    localStorage.setItem("accent", newAccent);

    // Apply primary color variable updates to root variables
    const root = window.document.documentElement;
    
    let primaryColor = "59, 130, 246"; // default blue
    switch (newAccent) {
      case "emerald":
        primaryColor = "16, 185, 129";
        break;
      case "indigo":
        primaryColor = "79, 70, 229";
        break;
      case "violet":
        primaryColor = "139, 92, 246";
        break;
      case "rose":
        primaryColor = "244, 63, 94";
        break;
      case "amber":
        primaryColor = "245, 158, 11";
        break;
      case "blue":
      default:
        primaryColor = "59, 130, 246";
        break;
    }

    root.style.setProperty("--primary", primaryColor);
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
