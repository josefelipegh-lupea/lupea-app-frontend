"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getChatMessagesAsClient,
  sendMessageAsClient,
  sendMessageWithAttachmentAsClient,
  markChatAsReadAsClient,
  notifyClientPayment,
  ChatMessage,
  ChatOrder,
  ChatListItem,
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
  const { onNewChatMessage, onParticipantJoined, onParticipantLeft, joinChat, leaveChat, onlineParticipants } = useSocket();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [order, setOrder] = useState<ChatOrder | null>(null);
  const [chat, setChat] = useState<ChatListItem | null>(null);
  const [chatStatus, setChatStatus] = useState<string>("active");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [notifyingPayment, setNotifyingPayment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [providerOnline, setProviderOnline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      if (!jwt || role !== "client") return;
      try {
        setLoading(true);

        const messagesRes = await getChatMessagesAsClient(jwt, chatId);
        if (messagesRes.ok) {
          setMessages(messagesRes.data.messages);
          setOrder(messagesRes.data.chat.order);
          setChat(messagesRes.data.chat);
          setChatStatus(messagesRes.data.chat.status);
          setOrderStatus(messagesRes.data.chat.order.status);
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
    if (chatId) {
      console.log("Joining chat:", chatId);
      joinChat(parseInt(chatId));
    }
    return () => {
      if (chatId) {
        console.log("Leaving chat:", chatId);
        leaveChat(parseInt(chatId));
      }
    };
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onNewChatMessage((message) => {
      console.log("=== New message received ===");
      console.log("message.chatId:", message.chatId);
      console.log("chatId (from params):", chatId);
      console.log("chatId type:", typeof chatId);

      const targetChatId =
        typeof chatId === "string" ? parseInt(chatId, 10) : Number(chatId);
      console.log("targetChatId:", targetChatId, "isNaN:", isNaN(targetChatId));

      if (message.chatId && message.chatId === targetChatId) {
        console.log("✅ Adding message to state");
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message as unknown as ChatMessage];
        });
      } else {
        console.log("❌ Message chatId mismatch");
      }
    });

    return unsubscribe;
  }, [chatId, onNewChatMessage]);

  useEffect(() => {
    const numericChatId = parseInt(chatId, 10);
    
    const checkProviderOnline = () => {
      const participants = onlineParticipants[numericChatId];
      if (participants && chat?.participants?.provider) {
        const isOnline = participants.has(chat.participants.provider.id);
        setProviderOnline(isOnline);
      }
    };
    
    checkProviderOnline();
    
    const unsubJoined = onParticipantJoined((data) => {
      if (data.chatId === numericChatId && data.role === "provider") {
        setProviderOnline(true);
      }
    });
    
    const unsubLeft = onParticipantLeft((data) => {
      if (data.chatId === numericChatId && data.role === "provider") {
        setProviderOnline(false);
      }
    });
    
    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [chatId, onlineParticipants, onParticipantJoined, onParticipantLeft, chat]);

  const handleNotifyPayment = async () => {
    if (
      !jwt ||
      !order ||
      !order.id ||
      orderStatus !== "active" ||
      notifyingPayment
    )
      return;

    setNotifyingPayment(true);
    try {
      const res = await notifyClientPayment(jwt, order.id.toString());
      if (res.ok) {
        toast.success("Pago notificado al proveedor");
      }
    } catch (error) {
      toast.error("Error al notificar el pago");
      console.error("Error notifying payment:", error);
    } finally {
      setNotifyingPayment(false);
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSendMessage = async () => {
    if (!jwt || sending || chatStatus !== "active") return;

    setSending(true);
    try {
      let res;
      if (selectedFile) {
        res = await sendMessageWithAttachmentAsClient(
          jwt,
          chatId,
          newMessage.trim(),
          selectedFile,
        );
      } else if (newMessage.trim()) {
        res = await sendMessageAsClient(jwt, chatId, newMessage.trim());
      } else {
        setSending(false);
        return;
      }

      if (res.ok) {
        setMessages((prev) => [...prev, res.data.message]);
        setNewMessage("");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
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
            <button className={styles.backButton} onClick={() => router.back()}>
              <IconsApp.BackArrow />
            </button>
            <div className={styles.avatar}>
              {chat?.participants?.provider
                ? getInitials(chat.participants.provider.businessName)
                : "?"}
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerName}>
                {chat?.participants?.provider?.businessName || "Chat"}
                {providerOnline && (
                  <span className={styles.onlineIndicator} title="En línea">
                    <span className={styles.onlineDot}></span>
                  </span>
                )}
              </div>
              <div className={styles.headerOrder}>
                Orden: {order?.orderCode || ""}
              </div>
            </div>
          </div>

          {orderStatus === "active" && (
            <div
              className={`${styles.subHeader} ${styles.notifyPaymentBanner}`}
            >
              <div className={styles.notifyPaymentInfo}>
                <IconsApp.Camera color="#f08100" />
                <span>
                  ¿Ya pagaste? Envía el comprobante para que el proveedor
                  valide.
                </span>
              </div>
              <button
                className={styles.notifyPaymentButton}
                onClick={handleNotifyPayment}
                disabled={notifyingPayment}
              >
                {notifyingPayment ? "Notificando..." : "Notificar pago"}
              </button>
            </div>
          )}

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
                        message.senderRole === "client"
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
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: "none" }}
            />
            <button
              type="button"
              className={styles.attachButton}
              onClick={handleFileSelect}
              disabled={chatStatus !== "active"}
            >
              <IconsApp.Plus color="#f08100" />
            </button>
            <div className={styles.inputWrapper}>
              {selectedFile && (
                <div className={styles.selectedFile}>
                  <IconsApp.Document color="#f08100" />
                  <span className={styles.fileName}>{selectedFile.name}</span>
                  <button
                    type="button"
                    className={styles.removeFile}
                    onClick={() => {
                      setSelectedFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                  >
                    <IconsApp.Close color="#f08100" />
                  </button>
                </div>
              )}
              <input
                type="text"
                className={styles.input}
                placeholder={
                  chatStatus === "read_only"
                    ? "Chat cerrado"
                    : selectedFile
                      ? "Agrega un mensaje..."
                      : "Escribe un mensaje..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={chatStatus !== "active"}
              />
            </div>
            <button
              className={styles.sendButton}
              onClick={handleSendMessage}
              disabled={
                (!newMessage.trim() && !selectedFile) ||
                sending ||
                chatStatus !== "active"
              }
            >
              <IconsApp.Send />
            </button>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
