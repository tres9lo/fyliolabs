import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/server-supabase";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Fyliolabs - Secure Cloud File Orchestration",
    template: "%s | Fyliolabs"
  },
  description: "Experience premium, secure multi-tenant cloud storage, document workspace creation, and file conversion orchestration. Built for modern builders by Objective-Dev.",
  applicationName: "Fyliolabs",
  authors: [{ name: "Trésor Dev Biko", url: "https://tresor-dev.vercel.app" }],
  generator: "Next.js",
  keywords: ["cloud file management", "secure document workspace", "cloudinary orchestrator", "file converter", "Supabase multi-tenant storage", "Objective-Dev"],
  referrer: "origin-when-cross-origin",
  creator: "Objective-Dev",
  publisher: "Objective-Dev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://fyliolabs.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Fyliolabs - Secure Cloud File Orchestration",
    description: "Experience premium, secure multi-tenant cloud storage, document workspace creation, and file conversion orchestration. Built for modern builders by Objective-Dev.",
    url: "https://fyliolabs.vercel.app",
    siteName: "Fyliolabs",
    images: [
      {
        url: "/companybanner.png",
        width: 1200,
        height: 630,
        alt: "Fyliolabs Premium Cloud Orchestrator Banner",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fyliolabs - Secure Cloud File Orchestration",
    description: "Experience premium, secure multi-tenant cloud storage, document workspace creation, and file conversion orchestration. Built for modern builders by Objective-Dev.",
    creator: "@_.iamtres",
    images: ["/companybanner.png"],
  },
  icons: {
    icon: "/image.png",
    shortcut: "/image.png",
    apple: "/image.png",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  const messages = await getMessages();
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500&display=swap"
        />
        <Script
          id="theme-accent-loader"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: `
            (function() {
              try {
                var savedTheme = localStorage.getItem('theme');
                var root = document.documentElement;
                var isDark = savedTheme === 'dark' || ((!savedTheme || savedTheme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches);
                if (isDark) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                }

                var savedAccent = localStorage.getItem('accent');
                if (savedAccent) {
                  var palettes = {
                    blue: { 50: "#eff6ff", 100: "#dbeafe", 200: "#bfdbfe", 300: "#93c5fd", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8", 800: "#1e40af", 900: "#1e3a8a" },
                    emerald: { 50: "#ecfdf5", 100: "#d1fae5", 200: "#a7f3d0", 300: "#6ee7b7", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857", 800: "#065f46", 900: "#064e3b" },
                    indigo: { 50: "#e0e7ff", 100: "#c7d2fe", 200: "#a5b4fc", 300: "#818cf8", 400: "#6366f1", 500: "#4f46e5", 600: "#4338ca", 700: "#3730a3", 800: "#312e81", 900: "#1e1b4b" },
                    violet: { 50: "#f5f3ff", 100: "#ede9fe", 200: "#ddd6fe", 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 800: "#5b21b6", 900: "#4c1d95" },
                    rose: { 50: "#fff1f2", 100: "#ffe4e6", 200: "#fecdd3", 300: "#fda4af", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c", 800: "#9f1239", 900: "#881337" },
                    amber: { 50: "#fffbeb", 100: "#fef3c7", 200: "#fde68a", 300: "#fcd34d", 400: "#fbbf24", 500: "#f59e0b", 600: "#d97706", 700: "#b45309", 800: "#92400e", 900: "#78350f" }
                  };
                  var palette = palettes[savedAccent];
                  if (palette) {
                    for (var shade in palette) {
                      root.style.setProperty('--primary-' + shade, palette[shade]);
                    }
                  }
                }
              } catch (e) {}
            })();
          ` }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SupabaseProvider initialSession={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ToastProvider>{children}</ToastProvider>
          </NextIntlClientProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
