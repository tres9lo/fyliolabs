"use client";

import { useEffect } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("Global root crash captured:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] font-sans">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl text-center space-y-6 shadow-2xl border border-gray-200">
          <div className="mx-auto w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100 shadow-sm">
            <AlertOctagon className="h-8 w-8 text-rose-600" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">
            Root Layout Failure
          </span>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Fatal system error.
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              The root layout system experienced a fatal initialization error. Please trigger a full hard reload.
            </p>
          </div>

          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold active:scale-95 transition-all cursor-pointer text-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Attempt System Recovery
          </button>
        </div>
      </body>
    </html>
  );
}
