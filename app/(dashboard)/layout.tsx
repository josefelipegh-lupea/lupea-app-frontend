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
      <SidebarProvider>
        <main className={styles.mainContent}>{children}</main>
        <div className={styles.mobileFooterWrapper}>
          <Footer />
        </div>
      </SidebarProvider>
    </div>
  );
}
