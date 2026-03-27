"use client";

import styles from "./Footer.module.css";
import { IconsApp } from "../icons/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";

export const Footer = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const userRole = role === "provider" ? "vendor" : "user";
  const { isExpanded, toggleSidebar } = useSidebar();
  const { unreadCount } = useSocket();

  const tabs = [
    {
      id: "home",
      Icon: IconsApp.Home,
      path: `/home/${userRole}`,
      label: "Inicio",
    },
    {
      id: "notifications",
      Icon: IconsApp.Bell,
      path: `/notifications/${userRole}`,
      label: "Notificaciones",
      showBadge: unreadCount > 0,
    },
    { id: "chat", Icon: IconsApp.Chat, path: "/chat", label: "Chat" },
    {
      id: "user",
      Icon: IconsApp.User,
      path: `/profile/${userRole}`,
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
        {tabs.map(({ id, Icon, path, label, showBadge }) => {
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
                    {showBadge && (
                      <span className={styles.notificationBadge}></span>
                    )}
                    {isExpanded && (
                      <span className={styles.desktopLabel}>{label}</span>
                    )}
                  </div>
                ) : (
                  <>
                    <span className={styles.tabIcon}>
                      <Icon color={inactiveColor} />
                      {showBadge && (
                        <span className={styles.notificationBadge}></span>
                      )}
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
