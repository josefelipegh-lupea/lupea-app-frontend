"use client";

import styles from "./Footer.module.css";
import { IconsApp } from "../icons/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";

export const Footer = () => {
  const pathname = usePathname();
  const role = pathname.includes("/vendor") ? "vendor" : "user";
  const { isExpanded, toggleSidebar } = useSidebar();

  const tabs = [
    { id: "home", Icon: IconsApp.Home, path: `/home/${role}`, label: "Inicio" },
    { id: "chat", Icon: IconsApp.Chat, path: "/chat", label: "Chat" },
    {
      id: "user",
      Icon: IconsApp.User,
      path: `/profile/${role}`,
      label: "Perfil",
    },
  ];

  return (
    <footer
      className={`${styles.tabBar} ${!isExpanded ? styles.collapsed : ""}`}
    >
      <button className={styles.toggleBtn} onClick={toggleSidebar}>
        {isExpanded ? "❮" : "❯"}
      </button>

      <div className={styles.sidebarLogo}>
        <span className={styles.logoText}>{isExpanded ? "Lupea" : "L"}</span>
      </div>

      <div className={styles.navContainer}>
        {tabs.map(({ id, Icon, path, label }) => {
          const isActive = pathname.startsWith(path);
          const activeColor = "#F08400";
          const inactiveColor = "#757575";

          return (
            <Link
              key={id}
              href={path}
              className={styles.linkWrapper}
              title={!isExpanded ? label : ""}
            >
              <div
                className={`${styles.tabItem} ${
                  isActive ? styles.tabItemActive : ""
                }`}
              >
                {isActive ? (
                  <div className={styles.activeIndicator}>
                    <span className={styles.tabIconActive}>
                      <Icon color={activeColor} />
                    </span>
                    {isExpanded && (
                      <span className={styles.desktopLabel}>{label}</span>
                    )}
                  </div>
                ) : (
                  <>
                    <span className={styles.tabIcon}>
                      <Icon color={inactiveColor} />
                    </span>
                    {isExpanded && (
                      <span className={styles.desktopLabel}>{label}</span>
                    )}
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </footer>
  );
};
