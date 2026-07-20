import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";
import AuthSync from "@/components/AuthSync";
import AppLifecycleTracker from "@/components/AppLifecycleTracker";

/**
 * Headings only. The app was entirely system-ui, so it rendered as Segoe UI on
 * Windows and SF on iOS — competent but anonymous, and indistinguishable from
 * default OS chrome. Nunito is rounded and warm enough to match the paper
 * palette, and carries the accents French needs (latin-ext).
 *
 * next/font self-hosts the file at build time, so there's no request to Google
 * at runtime — which also keeps it working offline in the PWA and avoids a
 * third-party origin in the CSP. Body text deliberately stays on the system
 * stack: it renders with zero latency, and the reading surface was already
 * well-tuned at 17px/1.8.
 */
const display = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lire — French Reader",
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
    // iOS Safari's "Add to Home Screen" doesn't support SVG for this — needs a PNG.
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4EEE0",
  width: "device-width",
  initialScale: 1,
  // Zoom is deliberately left enabled. This is a reading app for language
  // learners, so pinch-zooming a tricky line is a normal thing to want, and
  // locking scale fails WCAG 1.4.4. The font-size setting complements zoom,
  // it doesn't replace it.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={display.variable}>
      <body>
        {/* App is capped to a phone-like width and centered on desktop. */}
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-cream shadow-card">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <ServiceWorker />
        <AuthSync />
        <AppLifecycleTracker />
      </body>
    </html>
  );
}
