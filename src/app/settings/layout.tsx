import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings - Fyliolabs",
  description: "Manage your account settings",
};

export default function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="space-y-6">{children}</div>;
}
