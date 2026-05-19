"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log segment crashes to cloud providers
    console.error("Runtime crash captured:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[var(--background)] to-[var(--surface-muted)] relative overflow-hidden select-none">
      {/* Dynamic atmospheric backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-400/10 dark:bg-rose-500/5 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-amber-500/5 blur-3xl rounded-full pointer-events-none" />

      {/* Main glass containment card */}
      <div className="glass max-w-md w-full p-8 rounded-3xl text-center space-y-6 shadow-2xl relative z-10 border border-[var(--border)] bg-surface hover:scale-[1.01] transition-transform duration-300">
        
        {/* Animated Warning Icon */}
        <div className="mx-auto w-16 h-16 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shadow-sm animate-pulse duration-2000">
          <AlertOctagon className="h-8 w-8 text-rose-600 dark:text-rose-400" />
        </div>

        {/* Status code ribbon */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 uppercase tracking-widest animate-pulse">
          Crash captured by orchestrator
        </span>

        {/* Main textual statement */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Something went sideways.
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            The page segment experienced an unexpected runtime exception. Our cloud engineers have been informed of the details.
          </p>
        </div>

        {/* Display captured error message for high-fidelity debugging */}
        {error.message && (
          <div className="p-3 bg-red-50/50 dark:bg-red-950/15 border border-red-100/50 dark:border-red-900/10 rounded-xl max-h-24 overflow-y-auto text-left">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-0.5">
              Exception Log:
            </span>
            <code className="text-xs text-red-600 dark:text-red-400 font-mono break-all leading-normal">
              {error.message}
            </code>
          </div>
        )}

        {/* Quick action buttons */}
        <div className="pt-2 flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold shadow-md shadow-primary-500/20 hover:shadow-primary-600/30 active:scale-95 transition-all cursor-pointer text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Reload Segment & Retry
          </button>

          <Link
            href="/files"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-[var(--border)] hover:bg-[var(--surface-muted)] text-gray-700 dark:text-gray-300 rounded-xl font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            <Home className="h-4 w-4 text-gray-400" />
            Return to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer signoff */}
      <span className="absolute bottom-6 text-[10px] text-gray-400 tracking-wider uppercase font-bold">
        Fyliolabs Cloud Orchestrator
      </span>
    </div>
  );
}
