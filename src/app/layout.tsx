import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MainLayout } from "@/components/MainLayout";
import { Toaster } from "@/components/ui/sonner";
import { AnalyticsTracker } from "@/components/AnalyticsTracker";
import { NotificationLoader } from "@/components/NotificationLoader";

import RegisterSW from "@/components/RegisterSW";
import InstallPWA from "@/components/InstallPWA";

export const metadata: Metadata = {
  title: "Wanyzx | AI Engineer",
  description: "Personal portfolio of Wanyzx - AI Engineer",
  
  // 👇 TAMBAHAN PWA
  manifest: "/manifest.json",
  themeColor: "#0f172a",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Wanyzx",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
  		<RegisterSW />
  		<InstallPWA />
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="8fc69233-d06f-4d9c-b04a-c6c787ea3c5e"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
          <ThemeProvider>
            <NotificationLoader />
            <MainLayout>
              {children}
            </MainLayout>
          </ThemeProvider>
          <AnalyticsTracker />
            <Toaster position="top-center" richColors closeButton />
          <VisualEditsMessenger />
      </body>
    </html>
  );
}