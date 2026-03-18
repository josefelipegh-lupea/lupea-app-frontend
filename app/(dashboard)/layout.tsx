"use client";

import { Footer } from "@/components/footer/Footer";
import styles from "./layout.module.css";
import { SidebarProvider } from "@/context/SidebarContext";
import { FooterVisibilityProvider, useFooterVisibility } from "@/context/FooterVisibilityContext";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

function FooterWrapper() {
  const { isFooterVisible } = useFooterVisibility();
  
  if (!isFooterVisible) return null;
  
  return (
    <div className={styles.mobileFooterWrapper}>
      <Footer />
    </div>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { isFooterVisible } = useFooterVisibility();
  const pathname = usePathname();
  
  return (
    <div className={styles.container}>
      <SidebarProvider>
        <AnimatePresence mode="wait" initial={false}>
          <main 
            key={pathname}
            className={`${styles.mainContent} ${!isFooterVisible ? styles.noFooterRadius : ""}`} 
            id="scroll-container"
          >
            {children}
          </main>
        </AnimatePresence>
        <FooterWrapper />
      </SidebarProvider>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FooterVisibilityProvider>
      <DashboardContent>{children}</DashboardContent>
    </FooterVisibilityProvider>
  );
}
