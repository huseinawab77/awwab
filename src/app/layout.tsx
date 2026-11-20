import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/Toast";
import "./globals.css";

// Self-hosted variable font (OFL), so builds never depend on Google Fonts being reachable.
const schibsted = localFont({
  src: "../fonts/schibsted-grotesk-latin-wght-normal.woff2",
  variable: "--font-schibsted",
  weight: "400 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AWWAB",
  description: "Catat kebiasaan harian, kejar skor 100 tiap hari.",
  appleWebApp: { capable: true, title: "AWWAB", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#1F2A3D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${schibsted.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
