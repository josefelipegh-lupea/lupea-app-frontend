import { Footer } from "@/components/footer/Footer";
import styles from "./layout.module.css";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.container}>
      <main className={styles.mainContent}>
        <SidebarProvider>
          {children}
          <div className={styles.mobileFooterWrapper}>
            <Footer />
          </div>
        </SidebarProvider>
      </main>
    </div>
  );
}
