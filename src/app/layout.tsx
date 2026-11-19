import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "@/components/Toast";
import "./globals.css";

// Self-hosted variable fonts (OFL), so builds never depend on Google Fonts being reachable.
const jakarta = localFont({
  src: "../fonts/plus-jakarta-sans-latin-wght-normal.woff2",
  variable: "--font-jakarta",
  weight: "200 800",
  display: "swap",
});

const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AWWAB",
  description: "Catat kebiasaan harian, kejar skor 100 tiap hari.",
  appleWebApp: { capable: true, title: "AWWAB", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#2B2350",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${jakarta.variable} ${bricolage.variable}`}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
