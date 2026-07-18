import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";
import AuthSync from "@/components/AuthSync";
import AppLifecycleTracker from "@/components/AppLifecycleTracker";

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
    <html lang="en">
      <body>
        {/* App is capped to a phone-like width and centered on desktop. */}
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-cream shadow-sm">
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
