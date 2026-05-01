"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import DateSeparator from "@/components/chat/DateSeparator";
import ChatInput from "@/components/chat/ChatInput";
import PaymentSheet from "@/components/chat/PaymentSheet";
import styles from "./Conversation.module.css";
import { IconsApp } from "@/components/icons/Icons";
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
  const [notifyingPayment, setNotifyingPayment] = useState(false);
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [isProviderOnline, setIsProviderOnline] = useState(false);
  const [providerLeftAt, setProviderLeftAt] = useState<Date | null>(null);
  const [numericChatId, setNumericChatId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch messages on mount
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
          setNumericChatId(messagesRes.data.chat.id);
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

  // Real-time: online presence
  useEffect(() => {
    const numId = parseInt(chatId, 10);

    // Check current online set
    const participants = onlineParticipants[numId];
    if (participants && chat?.participants?.provider) {
      setIsProviderOnline(participants.has(chat.participants.provider.id));
    }

    const unsubJoined = onParticipantJoined((data) => {
      if (data.chatId === numId && data.role === "provider") {
        setIsProviderOnline(true);
        setProviderLeftAt(null);
      }
    });

    const unsubLeft = onParticipantLeft((data) => {
      if (data.chatId === numId && data.role === "provider") {
        setIsProviderOnline(false);
        setProviderLeftAt(new Date());
      }
    });

    return () => {
      unsubJoined();
      unsubLeft();
    };
  }, [chatId, onlineParticipants, onParticipantJoined, onParticipantLeft, chat]);

  // Send message (text or with attachment)
  const handleSend = useCallback(
    async (content: string, file?: File) => {
      if (!jwt || sending || chatStatus !== "active") return;
      if (!content.trim() && !file) return;

      setSending(true);
      try {
        if (file) {
          await sendMessageWithAttachmentAsClient(jwt, chatId, content, file);
        } else {
          await sendMessageAsClient(jwt, chatId, content);
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

  // Payment notification
  const handlePaymentConfirm = async (file: File, note?: string) => {
    if (!jwt || !order?.id || notifyingPayment) return;
    setNotifyingPayment(true);
    try {
      const res = await notifyClientPayment(
        jwt,
        order.id.toString(),
        note || "Adjunto comprobante de pago para validación",
        file
      );
      if (res.ok) {
        toast.success("Pago notificado al proveedor");
        setPaymentSheetOpen(false);
        setOrderStatus("payment_validation");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Error al notificar pago");
      }
    } finally {
      setNotifyingPayment(false);
    }
  };

  // Provider last message date for lastSeen fallback
  const providerLastMessageAt = messages
    .filter((m) => m.senderRole === "provider")
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

  const providerName = chat?.participants?.provider?.businessName || "Proveedor";
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
            name={providerName}
            orderCode={order?.orderCode ?? null}
            orderStatus={orderStatus}
            isOtherOnline={isProviderOnline}
            participantLeftAt={providerLeftAt}
            lastMessageAt={providerLastMessageAt}
            onBack={() => router.back()}
          />

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
                      isOwn={message.senderRole === "client"}
                    />
                  ))}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Notify payment bar (above input, only when order is active) */}
          {orderStatus === "active" && (
            <div className={styles.notifyPaymentBar}>
              <button
                className={styles.notifyPaymentBtn}
                onClick={() => setPaymentSheetOpen(true)}
                disabled={notifyingPayment}
                type="button"
              >
                <IconsApp.Document color="#1b5e20" />
                Notificar pago
              </button>
            </div>
          )}

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

      {/* Payment sheet */}
      <PaymentSheet
        isOpen={paymentSheetOpen}
        onClose={() => setPaymentSheetOpen(false)}
        onConfirm={handlePaymentConfirm}
        loading={notifyingPayment}
      />
    </PageAnimation>
  );
}
