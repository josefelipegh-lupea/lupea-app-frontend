import React from "react";
import styles from "./MainLayout.module.css";
import { Footer } from "../footer/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (id: string) => void;
}

export const MainLayout = ({
  children,
  activeTab,
  onTabChange,
}: MainLayoutProps) => {
  return (
    <div className={styles.pageWrapper}>
      {/* El contenedor con bordes redondeados */}
      <main className={styles.mainContainer}>
        <div className={styles.contentScrollable}>{children}</div>
      </main>

      {/* El Footer fijo abajo */}
      <Footer activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};
