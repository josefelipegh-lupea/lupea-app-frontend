"use client";

import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { IconsApp } from "@/components/icons/Icons";
import { useSocket, Notification } from "@/context/SocketContext";
import { useSidebar } from "@/context/SidebarContext";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";
import { useAuth } from "@/context/AuthContext";
import { getProviderRequests } from "@/app/lib/api/provider/home/request";
import { getMyRequests } from "@/app/lib/api/client/home/request";
import { getProviderOrders } from "@/app/lib/api/provider/home/order";
import { getMyClientOrders } from "@/app/lib/api/client/home/order";
import styles from "../Notifications.module.css";
import Header from "@/components/header/Header";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
  const params = useParams();
  const role = params.role as string;
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const { isFooterVisible } = useFooterVisibility();
  const { jwt, role: userRole } = useAuth();
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useSocket();
  const [cachedData, setCachedData] = useState<{
    // matches: id numerico del match -> documentId del match (para provider.request_assigned)
    matches: Array<{ id: number; documentId: string }>;
    orders: Array<{ id: number; documentId: string }>;
  }>({ matches: [], orders: [] });

  useEffect(() => {
    const fetchCachedData = async () => {
      if (!jwt || !userRole) return;

      try {
        if (userRole === "provider") {
          const [requestsRes, ordersRes] = await Promise.all([
            getProviderRequests(jwt),
            getProviderOrders(jwt),
          ]);
          setCachedData({
            // Guardamos el id/documentId del MATCH (no del request interno)
            // porque la pagina /home/vendor/request/[id] espera el documentId del match
            matches: requestsRes.data?.requests?.map((r: { id: number; documentId: string }) => ({ id: r.id, documentId: r.documentId })) || [],
            orders: ordersRes.data?.orders?.map((o: { id: number; documentId: string }) => ({ id: o.id, documentId: o.documentId })) || [],
          });
        } else {
          const [requestsRes, ordersRes] = await Promise.all([
            getMyRequests(jwt),
            getMyClientOrders(jwt),
          ]);
          setCachedData({
            matches: requestsRes.data?.requests?.map((r: { id: number; documentId: string }) => ({ id: r.id, documentId: r.documentId })) || [],
            orders: ordersRes.data?.orders?.map((o: { id: number; documentId: string }) => ({ id: o.id, documentId: o.documentId })) || [],
          });
        }
      } catch (error) {
        console.error("Error fetching cached data:", error);
      }
    };

    fetchCachedData();
  }, [jwt, userRole]);

  const findDocumentId = (id: number, list: Array<{ id: number; documentId: string }>): string | null => {
    const item = list.find((i) => i.id === id);
    return item?.documentId || null;
  };

  const shouldRemoveOnClick = (notification: Notification) =>
    notification.type === "client.order_completed" ||
    notification.type === "provider.order_generated" ||
    notification.type === "provider.payment_notified" ||
    notification.type === "chat.payment_proof_uploaded";

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id, { remove: shouldRemoveOnClick(notification) });

    const redirectTo = getRedirectUrl(notification);
    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  const getRedirectUrl = (notification: Notification): string | null => {
    const { type, data } = notification;

    switch (type) {
      case "provider.request_assigned": {
        // 1. Usar matchDocumentId si viene en la notificacion (campo nuevo)
        const matchDocId = data?.matchDocumentId as string | undefined;
        if (matchDocId) return `/home/vendor/request/${matchDocId}`;

        // 2. Usar matchId numerico para buscar en el cache de matches
        const matchId = data?.matchId as number | undefined;
        const cachedMatchDocId = matchId ? findDocumentId(matchId, cachedData.matches) : null;
        if (cachedMatchDocId) return `/home/vendor/request/${cachedMatchDocId}`;

        // 3. Fallback al home del proveedor
        return "/home/vendor";
      }
      case "client.quote_received": {
        const requestDocId = data?.requestDocumentId as string | undefined;
        if (requestDocId) return `/home/user/request/${requestDocId}/quotes`;
        return "/home/user";
      }
      case "provider.order_generated": {
        const orderId = data?.orderId as number | undefined;
        const docId = orderId ? findDocumentId(orderId, cachedData.orders) : null;
        if (docId) return `/home/vendor/orders/${docId}`;
        return "/home/vendor";
      }
      case "provider.payment_notified": {
        const orderId = data?.orderId as number | undefined;
        const docId = orderId ? findDocumentId(orderId, cachedData.orders) : null;
        if (docId) return `/home/vendor/orders/${docId}`;
        return "/home/vendor";
      }
      case "chat.payment_proof_uploaded": {
        const orderId = data?.orderId as number | undefined;
        const docId = orderId ? findDocumentId(orderId, cachedData.orders) : null;
        if (docId) return `/home/vendor/orders/${docId}`;
        return "/home/vendor";
      }
      case "client.order_completed": {
        const orderId = data?.orderId as number | undefined;
        const docId = orderId ? findDocumentId(orderId, cachedData.orders) : null;
        if (docId) return `/home/user/orders/${docId}`;
        return "/home/user";
      }
      default:
        return null;
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
      case "chat.payment_proof_uploaded":
        return <IconsApp.CreditCard />;
      case "client.order_completed":
        return <IconsApp.Check color="#22c55e" />;
      default:
        return <IconsApp.Notification />;
    }
  };

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
        <Header title="Notificaciones" showBackButton={false} />

        <div className={styles.headerActions}>
          {unreadCount > 0 && (
            <button className={styles.markAllBtn} onClick={markAllAsRead}>
              Marcar todo como leído
            </button>
          )}
        </div>

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
