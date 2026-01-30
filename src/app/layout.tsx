import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Reserve-One | 予約管理",
  description: "個人事業主向け予約管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900">
        {children}
        <Toaster richColors position="top-center" closeButton />
      </body>
    </html>
  );
}
