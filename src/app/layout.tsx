import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Newsreader, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";
import AuthSync from "@/components/AuthSync";
import AppLifecycleTracker from "@/components/AppLifecycleTracker";
import ViewportHeightVar from "@/components/ViewportHeightVar";

const ui = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
  display: "swap",
});

const french = Newsreader({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-french",
  display: "swap",
});

const micro = Space_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-micro",
  display: "swap",
});

const numeral = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  variable: "--font-numeral",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lire - French Reader",
  description: "Read short French texts, tap words you don't know, review them later.",
  manifest: "/manifest.json",
  verification: {
    google: [
      "u197HJazPk2IJD1yT_A3U5j8NaQeee81Qzsy0L-4E_E",
      "W_cXUFCxm-jIs-_khC6W-3zDO7EmXez-1_OzLdDa63c",
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lire",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFCF4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${ui.variable} ${french.variable} ${micro.variable} ${numeral.variable}`} data-scroll-behavior="smooth">
      <body>
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-cream">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <ServiceWorker />
        <AuthSync />
        <AppLifecycleTracker />
        <ViewportHeightVar />
      </body>
    </html>
  );
}
