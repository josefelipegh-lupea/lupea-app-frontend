"use client";

import { useState } from "react";
import styles from "./layout/MainLayout.module.css";
import { Footer } from "./footer/Footer";

export default function MainWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("user");

  return (
    <div className={styles.pageWrapper}>
      <main className={styles.mainContainer}>
        <div className={styles.contentScrollable}>{children}</div>
      </main>
      <Footer activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
