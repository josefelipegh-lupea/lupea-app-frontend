"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getMyChatsAsClient, ChatListItem } from "@/app/lib/api/client/chat";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "../Chat.module.css";
import Header from "@/components/header/Header";
import { IconsApp } from "@/components/icons/Icons";

const ChatListPage: React.FC = () => {
  const router = useRouter();
  const { jwt, role } = useAuth();
  const { isExpanded } = useSidebar();
  const { onNewChatMessage } = useSocket();
  const [loading, setLoading] = useState(true);
  const [chats, setChats] = useState<ChatListItem[]>([]);

  const fetchChats = async () => {
    if (!jwt || role !== "client") return;
    try {
      setLoading(true);
      const res = await getMyChatsAsClient(jwt);
      if (res.ok) {
        setChats(res.data.chats);
      }
    } catch (error) {
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [jwt, role]);

  useEffect(() => {
    const unsubscribe = onNewChatMessage(() => {
      fetchChats();
    });
    return unsubscribe;
  }, [onNewChatMessage]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <main className={styles.mainContainer}>
            <Header title="Mensajes" />
            <div className={styles.container}>
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>Cargando...</p>
              </div>
            </div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Mensajes" />

          <div className={styles.container}>
            {chats.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <IconsApp.Chat />
                </div>
                <p className={styles.emptyText}>No tienes conversaciones aún</p>
              </div>
            ) : (
              <div className={styles.chatList}>
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={styles.chatItem}
                    onClick={() => router.push(`/chat/user/${chat.documentId}`)}
                  >
                    <div className={styles.avatar}>
                      {getInitials(chat.participants.provider.businessName)}
                    </div>
                    <div className={styles.chatInfo}>
                      <div className={styles.chatHeader}>
                        <span className={styles.chatName}>
                          {chat.participants.provider.businessName}
                        </span>
                        <span className={styles.chatTime}>
                          {formatTime(chat.lastMessageAt)}
                        </span>
                      </div>
                      <div className={styles.chatPreview}>
                        <span className={styles.lastMessage}>
                          {chat.lastMessagePreview || "Sin mensajes"}
                        </span>
                        {chat.unreadCount > 0 && (
                          <span className={styles.unreadBadge}>
                            {chat.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className={styles.orderInfo}>
                        Orden: {chat.order.orderCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </PageAnimation>
  );
};

export default ChatListPage;
