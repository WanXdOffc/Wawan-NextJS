"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { NotificationPopup } from "@/components/NotificationPopup";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
    const isAdminRoute = pathname.startsWith("/admin");
    const isWanyzxRoute = pathname.startsWith("/features/wanyzx-ai") || pathname.startsWith("/wanyzx-ai/docs");

  if (isAdminRoute || isWanyzxRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <AnimatedBackground />
      <Header />
      <main className="relative z-10 min-h-screen pt-24">
        {children}
      </main>
      <Footer />
      <NotificationPopup />
    </>
  );
}
