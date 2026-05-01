"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getChatMessagesAsProvider,
  sendMessageAsProvider,
  sendMessageWithAttachmentAsProvider,
  markChatAsReadAsProvider,
  confirmProviderPayment,
  ChatMessage,
  ChatOrder,
  ChatListItem,
} from "@/app/lib/api/provider/chat";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator from "@/components/chat/DateSeparator";
import ChatInput from "@/components/chat/ChatInput";
import styles from "../../user/[id]/Conversation.module.css";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "HOY";
  if (date.toDateString() === yesterday.toDateString()) return "AYER";
  return date
    .toLocaleDateString("es-VE", { day: "numeric", month: "short" })
    .toUpperCase();
}

function groupMessagesByDate(
  msgs: ChatMessage[]
): { date: string; messages: ChatMessage[] }[] {
  const groups: { date: string; messages: ChatMessage[] }[] = [];
  let currentDate = "";
  msgs.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (label !== currentDate) {
      currentDate = label;
      groups.push({ date: label, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
}

export default function ConversationPage(_props: PageProps) {
  const { id: chatId } = useParams() as { id: string };
  const router = useRouter();
  const { jwt, role } = useAuth();
  const { isExpanded } = useSidebar();
  const {
    onNewChatMessage,
    onParticipantJoined,
    onParticipantLeft,
    onPaymentNotified,
    joinChat,
    leaveChat,
    onlineParticipants,
  } = useSocket();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [order, setOrder] = useState<ChatOrder | null>(null);
  const [chat, setChat] = useState<ChatListItem | null>(null);
  const [chatStatus, setChatStatus] = useState<string>("active");
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [isClientOnline, setIsClientOnline] = useState(false);
  const [clientLeftAt, setClientLeftAt] = useState<Date | null>(null);
  const [numericChatId, setNumericChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount
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
          setNumericChatId(messagesRes.data.chat.id);
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

  // Join/leave socket room
  useEffect(() => {
    if (chatId) joinChat(parseInt(chatId));
    return () => {
      if (chatId) leaveChat(parseInt(chatId));
    };
  }, [chatId, joinChat, leaveChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time: new messages
  useEffect(() => {
    const unsubscribe = onNewChatMessage((message) => {
      if (numericChatId && message.chatId === numericChatId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message as unknown as ChatMessage];
        });
      }
    });
    return unsubscribe;
  }, [numericChatId, onNewChatMessage]);

  // Real-time: payment notified by client
  useEffect(() => {
    const unsubscribe = onPaymentNotified((data) => {
      if (numericChatId && data.chatId === numericChatId) {
        setOrderStatus("payment_validation");
        if (data.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) return prev;
            return [...prev, data.message as unknown as ChatMessage];
          });
        }
        toast.success("El cliente ha notificado el pago");
      }
    });
    return unsubscribe;
  }, [numericChatId, onPaymentNotified]);

  // Real-time: online presence
  useEffect(() => {
    const numId = parseInt(chatId, 10);

    const participants = onlineParticipants[numId];
    if (participants && chat?.participants?.customer) {
      setIsClientOnline(participants.has(chat.participants.customer.id));
    }

    const unsubJoined = onParticipantJoined((data) => {
      if (data.chatId === numId && data.role === "client") {
        setIsClientOnline(true);
        setClientLeftAt(null);
      }
    });

    const unsubLeft = onParticipantLeft((data) => {
      if (data.chatId === numId && data.role === "client") {
        setIsClientOnline(false);
        setClientLeftAt(new Date());
      }
    });

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [chatId, onlineParticipants, onParticipantJoined, onParticipantLeft, chat]);

  // Confirm payment
  const handleConfirmPayment = async () => {
    if (!jwt || !order?.id || orderStatus !== "payment_validation" || confirmingPayment)
      return;

    setConfirmingPayment(true);
    try {
      const res = await confirmProviderPayment(
        jwt,
        order.id.toString(),
        "Pago validado correctamente. Procedo a completar la orden."
      );
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

  // Send message (text or with attachment)
  const handleSend = useCallback(
    async (content: string, file?: File) => {
      if (!jwt || sending || chatStatus !== "active") return;
      if (!content.trim() && !file) return;

      setSending(true);
      try {
        if (file) {
          await sendMessageWithAttachmentAsProvider(jwt, chatId, content, file);
        } else {
          await sendMessageAsProvider(jwt, chatId, content);
        }
      } catch (error) {
        toast.error("Error al enviar mensaje");
        console.error("Error sending message:", error);
      } finally {
        setSending(false);
      }
    },
    [jwt, sending, chatStatus, chatId]
  );

  // Client last message date for lastSeen fallback
  const clientLastMessageAt = messages
    .filter((m) => m.senderRole === "client")
    .at(-1)?.createdAt ?? chat?.lastMessageAt ?? null;

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

  const clientName = chat?.participants?.customer?.username || "Cliente";
  const messageGroups = groupMessagesByDate(messages);

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          {/* Header */}
          <ChatHeader
            name={clientName}
            orderCode={order?.orderCode ?? null}
            orderStatus={orderStatus}
            isOtherOnline={isClientOnline}
            participantLeftAt={clientLeftAt}
            lastMessageAt={clientLastMessageAt}
            onBack={() => router.back()}
          />

          {/* Payment banners (provider side) */}
          {orderStatus === "active" && (
            <div className={`${styles.subHeader} ${styles.waitingPaymentBanner}`}>
              <div className={styles.waitingPaymentInfo}>
                <span className={styles.bannerIcon}>⏳</span>
                <span>Esperando que el cliente notifique el pago...</span>
              </div>
              <button
                className={styles.confirmPaymentButton}
                disabled
                type="button"
              >
                Confirmar pago
              </button>
            </div>
          )}

          {orderStatus === "payment_validation" && (
            <div className={`${styles.subHeader} ${styles.confirmPaymentBanner}`}>
              <div className={styles.confirmPaymentInfo}>
                <span className={styles.bannerIcon}>✅</span>
                <span>El cliente ha realizado el pago. Confirma para completar la orden.</span>
              </div>
              <button
                className={styles.confirmPaymentButton}
                onClick={handleConfirmPayment}
                disabled={confirmingPayment}
                type="button"
              >
                {confirmingPayment ? "Confirmando..." : "Confirmar pago"}
              </button>
            </div>
          )}

          {/* Messages */}
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
                  <DateSeparator label={group.date} />
                  {group.messages.map((message, msgIndex) => (
                    <MessageBubble
                      key={message.id || msgIndex}
                      message={message}
                      isOwn={message.senderRole === "provider"}
                    />
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            onSend={handleSend}
            disabled={chatStatus !== "active" || sending}
            placeholder={
              chatStatus === "read_only"
                ? "Chat cerrado"
                : "Escribir un mensaje..."
            }
          />
        </main>
      </div>
    </PageAnimation>
  );
}
