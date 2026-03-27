"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { IconsApp } from "@/components/icons/Icons";
import { useSocket, Notification } from "@/context/SocketContext";
import { useSidebar } from "@/context/SidebarContext";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";
import styles from "../Notifications.module.css";
import Header from "@/components/header/Header";

export default function NotificationsPage() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const { isFooterVisible } = useFooterVisibility();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useSocket();

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.data?.redirectTo) {
      router.push(notification.data.redirectTo as string);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "provider.request_assigned":
        return <IconsApp.Tool />;
      case "client.quote_received":
        return <IconsApp.Document color="#F08400" />;
      case "provider.order_generated":
        return <IconsApp.Document color="#F08400" />;
      case "provider.payment_notified":
        return <IconsApp.CreditCard />;
      case "client.order_completed":
        return <IconsApp.Check color="#22c55e" />;
      default:
        return <IconsApp.Notification />;
    }
  };

  const rightAction =
    unreadCount > 0 ? (
      <button className={styles.markAllBtn} onClick={markAllAsRead}>
        Marcar todo
      </button>
    ) : undefined;

  if (notifications.length === 0) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main
          className={`${styles.mainContainer} ${!isFooterVisible ? styles.noFooter : ""}`}
        >
          <Header title="Notificaciones" showBackButton={false} />

          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <IconsApp.Notification />
            </div>
            <p className={styles.emptyText}>No tienes notificaciones</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={`${styles.mainContainer} `}>
        <Header
          title="Notificaciones"
          rightAction={rightAction}
          showBackButton={false}
        />

        <div className={styles.content}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`${styles.notificationItem} ${
                !notification.read ? styles.unread : ""
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className={styles.iconWrapper}>
                {getNotificationIcon(notification.type)}
              </div>
              <div className={styles.notificationContent}>
                <p className={styles.notificationTitle}>{notification.title}</p>
                <p className={styles.notificationMessage}>
                  {notification.message}
                </p>
                <span className={styles.notificationTime}>
                  {new Date(notification.createdAt).toLocaleDateString(
                    "es-ES",
                    {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </span>
              </div>
              {!notification.read && <div className={styles.unreadDot} />}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
