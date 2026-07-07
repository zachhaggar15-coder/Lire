import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import ServiceWorker from "@/components/ServiceWorker";

export const metadata: Metadata = {
  title: "Lire — French Reader",
  description: "Read short French texts, tap words you don't know, review them later.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lire",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-slate-50 shadow-sm">
          <main className="flex-1 pb-24">{children}</main>
          <BottomNav />
        </div>
        <ServiceWorker />
      </body>
    </html>
  );
}
