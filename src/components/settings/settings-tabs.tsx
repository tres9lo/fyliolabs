"use client";

import { useState } from "react";
import { User, Globe, Palette, BarChart3 } from "lucide-react";
import { ProfileSettingsForm } from "./profile-settings-form";
import { LanguageSettings } from "./language-settings";
import { AppearanceSettings } from "./appearance-settings";
import { SystemStatsSettings } from "./system-stats-settings";

type ActiveTab = "profile" | "language" | "appearance" | "stats";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("profile");

  const tabs: { id: ActiveTab; label: string; description: string; icon: React.ReactNode }[] = [
    {
      id: "profile",
      label: "Account Profile",
      description: "Manage credentials and secure cloud credentials",
      icon: <User className="h-4 w-4" />,
    },
    {
      id: "appearance",
      label: "Themes & Accent",
      description: "Customize layout mode and primary brand colors",
      icon: <Palette className="h-4 w-4" />,
    },
    {
      id: "language",
      label: "Language Settings",
      description: "Select regional localized languages",
      icon: <Globe className="h-4 w-4" />,
    },
    {
      id: "stats",
      label: "System Diagnostics",
      description: "Real-time storage gauges and network latency metrics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Premium Glass Tab List Ribbon */}
      <div className="glass p-2.5 rounded-2xl border border-[var(--border)] overflow-x-auto flex gap-2 w-full shadow-sm select-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm border border-primary-200 dark:border-primary-900"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/40 border border-transparent"
              }`}
            >
              {tab.icon}
              <div className="flex flex-col items-start text-left">
                <span>{tab.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* active tab description */}
      <div className="px-1 text-xs text-gray-400 font-medium tracking-wide uppercase select-none">
        <span>Current Tab: </span>
        <span className="text-gray-600 dark:text-gray-300">
          {tabs.find((t) => t.id === activeTab)?.description}
        </span>
      </div>

      {/* Render selected widget panel with animate-in transitions */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
        {activeTab === "profile" && <ProfileSettingsForm />}
        {activeTab === "appearance" && <AppearanceSettings />}
        {activeTab === "language" && <LanguageSettings />}
        {activeTab === "stats" && <SystemStatsSettings />}
      </div>
    </div>
  );
}
export default SettingsTabs;
