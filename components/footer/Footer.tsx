"use client";

import styles from "./Footer.module.css";
import { IconsApp } from "../icons/Icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useSocket } from "@/context/SocketContext";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { getMyChatsAsClient } from "@/app/lib/api/client/chat";
import { getMyChatsAsProvider } from "@/app/lib/api/provider/chat";

export const Footer = () => {
  const pathname = usePathname();
  const { role } = useAuth();
  const userRole = role === "provider" ? "vendor" : "user";
  const { isExpanded, toggleSidebar } = useSidebar();
  const { unreadCount, chatUnreadCount, updateChatUnreadCount } = useSocket();
  const { jwt } = useAuth();

  useEffect(() => {
    const loadChatUnreadCount = async () => {
      if (!jwt) return;
      try {
        const res = role === "provider" 
          ? await getMyChatsAsProvider(jwt)
          : await getMyChatsAsClient(jwt);
        
        if (res.ok) {
          const totalUnread = res.data.chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
          updateChatUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Error loading chat unread count:", error);
      }
    };

    loadChatUnreadCount();
  }, [jwt, role, updateChatUnreadCount]);

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
      showBadge: unreadCount > 0 && !pathname.startsWith(`/notifications/${userRole}`),
    },
    { 
      id: "chat", 
      Icon: IconsApp.Chat, 
      path: `/chat/${userRole}`, 
      label: "Chat",
      showBadge: chatUnreadCount > 0 && !pathname.startsWith(`/chat/${userRole}`),
    },
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
                style={{ position: "relative" }}
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
                    </span>
                    {showBadge && (
                      <span className={styles.notificationBadge}></span>
                    )}
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
