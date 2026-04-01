"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getChatMessagesAsProvider,
  sendMessageAsProvider,
  markChatAsReadAsProvider,
  confirmProviderPayment,
  ChatMessage,
  ChatOrder,
  ChatListItem,
} from "@/app/lib/api/provider/chat";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "../../user/[id]/Conversation.module.css";
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
  const {
    onNewChatMessage,
    onParticipantJoined,
    onParticipantLeft,
    joinChat,
    leaveChat,
    onlineParticipants,
  } = useSocket();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [order, setOrder] = useState<ChatOrder | null>(null);
  const [chat, setChat] = useState<ChatListItem | null>(null);
  const [chatStatus, setChatStatus] = useState<string>("active");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [clientOnline, setClientOnline] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChat = async () => {
      if (!jwt || role !== "provider") return;
      try {
        setLoading(true);

        const messagesRes = await getChatMessagesAsProvider(jwt, chatId);
        if (messagesRes.ok) {
          setMessages(messagesRes.data.messages);
          setOrder(messagesRes.data.chat.order);
          setChat(messagesRes.data.chat);
          setChatStatus(messagesRes.data.chat.status);
          setOrderStatus(messagesRes.data.chat.order.status);
        }

        await markChatAsReadAsProvider(jwt, chatId);
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
      joinChat(parseInt(chatId));
    }
    return () => {
      if (chatId) {
        leaveChat(parseInt(chatId));
      }
    };
  }, [chatId, joinChat, leaveChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const unsubscribe = onNewChatMessage((message) => {
      if (message.chatId && message.chatId === parseInt(chatId)) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message as unknown as ChatMessage];
        });
      }
    });

    return unsubscribe;
  }, [chatId, onNewChatMessage]);

  useEffect(() => {
    const numericChatId = parseInt(chatId, 10);

    const checkClientOnline = () => {
      const participants = onlineParticipants[numericChatId];
      if (participants && chat?.participants?.customer) {
        const isOnline = participants.has(chat.participants.customer.id);
        setClientOnline(isOnline);
      }
    };

    checkClientOnline();

    const unsubJoined = onParticipantJoined((data) => {
      if (data.chatId === numericChatId && data.role === "client") {
        setClientOnline(true);
      }
    });

    const unsubLeft = onParticipantLeft((data) => {
      if (data.chatId === numericChatId && data.role === "client") {
        setClientOnline(false);
      }
    });

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [
    chatId,
    onlineParticipants,
    onParticipantJoined,
    onParticipantLeft,
    chat,
  ]);

  const handleConfirmPayment = async () => {
    if (
      !jwt ||
      !order ||
      !order.id ||
      orderStatus !== "payment_validation" ||
      confirmingPayment
    )
      return;

    const note = "Pago validado correctamente. Procedo a completar la orden.";

    setConfirmingPayment(true);
    try {
      const res = await confirmProviderPayment(jwt, order.id.toString(), note);
      if (res.ok) {
        toast.success("Pago confirmado y orden completada");
        setOrderStatus("completed");
        setChatStatus("read_only");
      }
    } catch (error) {
      toast.error("Error al confirmar el pago");
      console.error("Error confirming payment:", error);
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleSendMessage = async () => {
    if (!jwt || sending || chatStatus !== "active" || !newMessage.trim())
      return;

    setSending(true);
    try {
      const res = await sendMessageAsProvider(jwt, chatId, newMessage.trim());
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
            <button className={styles.backButton} onClick={() => router.back()}>
              <IconsApp.BackArrow />
            </button>
            <div className={styles.avatar}>
              {chat?.participants?.customer
                ? getInitials(chat.participants.customer.username)
                : "?"}
            </div>
            <div className={styles.headerInfo}>
              <div className={styles.headerName}>
                {chat?.participants?.customer?.username || "Chat"}
                {clientOnline && (
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

          {(orderStatus === "active" ||
            orderStatus === "payment_validation") && (
            <div
              className={`${styles.subHeader} ${orderStatus === "payment_validation" ? styles.confirmPaymentBanner : styles.waitingPaymentBanner}`}
            >
              <div
                className={
                  orderStatus === "payment_validation"
                    ? styles.confirmPaymentInfo
                    : styles.waitingPaymentInfo
                }
              >
                {orderStatus === "payment_validation" ? (
                  <>
                    <IconsApp.Check color="#22c55e" />
                    <span>
                      El cliente ha realizado el pago. Confirma para completar
                      la orden.
                    </span>
                  </>
                ) : (
                  <>
                    <IconsApp.OrangeClock color="#f08100" />
                    <span>Esperando que el cliente notifique el pago...</span>
                  </>
                )}
              </div>
              <button
                className={styles.confirmPaymentButton}
                onClick={handleConfirmPayment}
                disabled={
                  confirmingPayment || orderStatus !== "payment_validation"
                }
              >
                {confirmingPayment ? "Confirmando..." : "Confirmar pago"}
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
                        message.senderRole === "provider"
                          ? styles.sent
                          : styles.received
                      }`}
                    >
                      <div className={styles.messageBubble}>
                        {message.content}
                        {message.messageType === "payment_proof" &&
                          message.attachment && (
                            <div className={styles.attachment}>
                              <IconsApp.Document color="#f08100" />
                              <a
                                href={message.attachment.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.attachmentLink}
                              >
                                Ver comprobante
                              </a>
                            </div>
                          )}
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
                placeholder={
                  chatStatus === "read_only"
                    ? "Chat cerrado"
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
                !newMessage.trim() || sending || chatStatus !== "active"
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
