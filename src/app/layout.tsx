import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseServerClient } from "@/lib/server-supabase";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getLocale } from "next-intl/server";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Fyliolabs - Cloud File Orchestration",
  description: "Multi-tenant cloud file management platform",
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
                if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  root.classList.add('dark');
                } else {
                  root.classList.remove('dark');
                }

                var savedAccent = localStorage.getItem('accent');
                if (savedAccent) {
                  var primaryColor = "59, 130, 246";
                  switch (savedAccent) {
                    case "emerald": primaryColor = "16, 185, 129"; break;
                    case "indigo": primaryColor = "79, 70, 229"; break;
                    case "violet": primaryColor = "139, 92, 246"; break;
                    case "rose": primaryColor = "244, 63, 94"; break;
                    case "amber": primaryColor = "245, 158, 11"; break;
                  }
                  root.style.setProperty("--primary", primaryColor);
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
