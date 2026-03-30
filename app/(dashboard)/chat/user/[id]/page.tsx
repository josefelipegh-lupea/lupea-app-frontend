"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getOrderChatAsClient,
  getChatMessagesAsClient,
  sendMessageAsClient,
  markChatAsReadAsClient,
  ChatMessage,
  ChatParticipant,
  ChatOrder,
} from "@/app/lib/api/client/chat";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "./Conversation.module.css";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const { id: chatId } = useParams() as { id: string };
  const router = useRouter();
  const { jwt, role } = useAuth();
  const { isExpanded } = useSidebar();
  const { onNewChatMessage } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participant, setParticipant] = useState<ChatParticipant | null>(null);
  const [order, setOrder] = useState<ChatOrder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      if (!jwt || role !== "client") return;
      try {
        setLoading(true);
        
        const chatRes = await getOrderChatAsClient(jwt, chatId);
        if (chatRes.ok) {
          setParticipant(chatRes.data.chat.participant);
          setOrder(chatRes.data.chat.order);
        }

        const messagesRes = await getChatMessagesAsClient(jwt, chatId);
        if (messagesRes.ok) {
          setMessages(messagesRes.data.messages);
        }

        await markChatAsReadAsClient(jwt, chatId);
      } catch (error) {
        console.error("Error loading chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [jwt, role, chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onNewChatMessage((message) => {
      if (message.chatId && message.chatId === parseInt(chatId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message as ChatMessage];
        });
      }
    });

    return unsubscribe;
  }, [chatId, onNewChatMessage]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !jwt || sending) return;

    setSending(true);
    try {
      const res = await sendMessageAsClient(jwt, chatId, newMessage.trim());
      if (res.ok) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage("");
      }
    } catch (error) {
      toast.error("Error al enviar mensaje");
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Hoy";
    if (date.toDateString() === yesterday.toDateString()) return "Ayer";
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const groupMessagesByDate = (msgs: ChatMessage[]) => {
    const groups: { date: string; messages: ChatMessage[] }[] = [];
    let currentDate = "";

    msgs.forEach((msg) => {
      const msgDate = formatDate(msg.createdAt);
      if (msgDate !== currentDate) {
        currentDate = msgDate;
        groups.push({ date: msgDate, messages: [] });
      }
      groups[groups.length - 1].messages.push(msg);
    });

    return groups;
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
            <div className={styles.loadingState}>Cargando...</div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <div className={styles.chatHeader}>
            <button
              className={styles.backButton}
              onClick={() => router.push("/chat/user")}
            >
              <IconsApp.Back />
            </button>
            <div className={styles.avatar}>
              {participant ? getInitials(participant.name) : "?"}
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerName}>
                {participant?.name || "Chat"}
              </div>
              <div className={styles.headerOrder}>
                Orden: {order?.orderCode || ""}
              </div>
            </div>
          </div>

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p className={styles.emptyText}>
                  No hay mensajes aún. ¡Inicia la conversación!
                </p>
              </div>
            ) : (
              messageGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className={styles.dateSeparator}>{group.date}</div>
                  {group.messages.map((message, msgIndex) => (
                    <div
                      key={message.id || msgIndex}
                      className={`${styles.messageWrapper} ${
                        message.senderType === "client"
                          ? styles.sent
                          : styles.received
                      }`}
                    >
                      <div className={styles.messageBubble}>
                        {message.content}
                      </div>
                      <div className={styles.messageTime}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputContainer}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                className={styles.input}
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
            >
              <IconsApp.Send />
            </button>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
