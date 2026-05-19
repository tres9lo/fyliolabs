"use client";

import Link from "next/link";
import { HelpCircle, FileQuestion, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[var(--background)] to-[var(--surface-muted)] relative overflow-hidden select-none">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-400/10 dark:bg-primary-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Main glass box container */}
      <div className="glass max-w-md w-full p-8 rounded-3xl text-center space-y-6 shadow-2xl relative z-10 border border-[var(--border)] bg-surface hover:scale-[1.01] transition-transform duration-300">
        
        {/* Animated Question Icon */}
        <div className="mx-auto w-16 h-16 bg-primary-50 dark:bg-primary-950/30 rounded-2xl flex items-center justify-center border border-primary-100 dark:border-primary-900/30 shadow-sm animate-bounce duration-1000">
          <FileQuestion className="h-8 w-8 text-primary-600 dark:text-primary-400" />
        </div>

        {/* Status code ribbon */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 uppercase tracking-widest">
          Error 404 - Not Found
        </span>

        {/* Explanatory text */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Lost in the Cloud?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The page, file, or cloud asset you are looking for has either migrated to a new orchestrator, or never existed in the first place.
          </p>
        </div>

        {/* Back and help actions grid */}
        <div className="pt-4 flex flex-col gap-2.5">
          <Link
            href="/files"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Link>

          <Link
            href="/settings"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[var(--border)] hover:bg-[var(--surface-muted)] text-gray-700 dark:text-gray-300 rounded-xl font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            <HelpCircle className="h-4 w-4 text-gray-400" />
            Check Diagnostics
          </Link>
        </div>
      </div>

      {/* Decorative footer */}
      <span className="absolute bottom-6 text-[10px] text-gray-400 tracking-wider uppercase font-bold">
        Fyliolabs Cloud Orchestrator
      </span>
    </div>
  );
}
