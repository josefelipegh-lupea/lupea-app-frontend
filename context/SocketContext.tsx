"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { getNotifications, ServerNotification, markNotificationsAsRead } from "@/app/lib/api/client/notification";

type RefreshCallback = () => void;
import { IconsApp } from "@/components/icons/Icons";

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  id: number;
  documentId: string;
  chatId?: number;
  content: string;
  senderType: "client" | "provider";
  senderId: number;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

export interface ChatParticipant {
  id: number;
  documentId: string;
  name: string;
  type: "client" | "provider";
  avatar?: string;
}

export interface ChatOrder {
  id: number;
  documentId: string;
  orderCode: string;
  status: string;
  total: number;
  itemsCount: number;
  createdAt: string;
}

interface RealtimeConfig {
  enabled: boolean;
  provider: string;
  path: string;
  transports: string[];
  auth: {
    type: string;
    handshakeField: string;
    fallbackHeader: string;
  };
  events: {
    connected: string;
    notification: string;
    chat: {
      joined: string;
      left: string;
      created: string;
      message: string;
      messageRead: string;
      orderStatusChanged: string;
    };
  };
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  realtimeConfig: RealtimeConfig | null;
  onNotification: (
    callback: (notification: Notification) => void,
  ) => () => void;
  onNewChatMessage: (
    callback: (message: ChatMessage) => void,
  ) => () => void;
  onChatRead: (
    callback: (data: { chatId: number; messageId: number }) => void,
  ) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { jwt, user, role } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig | null>(
    null,
  );

  useEffect(() => {
    if (typeof window !== "undefined" && user) {
      const saved = localStorage.getItem("notifications");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotifications(parsed);
        } catch {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setNotifications([]);
        }
      }
    }
  }, [user]);

  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const notificationCallbacksRef = useRef<
    Set<(notification: Notification) => void>
  >(new Set());
  const chatMessageCallbacksRef = useRef<
    Set<(message: ChatMessage) => void>
  >(new Set());
  const chatReadCallbacksRef = useRef<
    Set<(data: { chatId: number; messageId: number }) => void>
  >(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

  const onNewChatMessage = useCallback(
    (callback: (message: ChatMessage) => void) => {
      chatMessageCallbacksRef.current.add(callback);
      return () => {
        chatMessageCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const onChatRead = useCallback(
    (callback: (data: { chatId: number; messageId: number }) => void) => {
      chatReadCallbacksRef.current.add(callback);
      return () => {
        chatReadCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const onNotification = useCallback(
    (callback: (notification: Notification) => void) => {
      notificationCallbacksRef.current.add(callback);
      return () => {
        notificationCallbacksRef.current.delete(callback);
      };
    },
    [],
  );

  const addNotification = useCallback((notification: Notification) => {
    setNotifications((prev) => {
      const updated = [notification, ...prev];
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    notificationCallbacksRef.current.forEach((callback) => {
      callback(notification);
    });

    toast(notification.message, {
      icon: <IconsApp.Notification />,
      duration: 10000,
    });
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    if (jwt) {
      try {
        await markNotificationsAsRead(jwt, { all: false, documentIds: [id] });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  }, [jwt]);

  const markAllAsRead = useCallback(async () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("notifications", JSON.stringify(updated));
      return updated;
    });

    if (jwt) {
      try {
        await markNotificationsAsRead(jwt, { all: true });
      } catch (error) {
        console.error("Error marking all notifications as read:", error);
      }
    }
  }, [jwt]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    localStorage.removeItem("notifications");
  }, []);

  const loadNotificationsFromServer = useCallback(async () => {
    if (!jwt) return;
    
    try {
      const res = await getNotifications(jwt, 50, null);
      if (res.ok && res.data.notifications) {
        const formattedNotifications: Notification[] = res.data.notifications.map(
          (n: ServerNotification) => ({
            id: n.documentId || n.id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            data: n.data,
            read: n.isRead,
            createdAt: n.createdAt,
          })
        );
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(formattedNotifications);
        localStorage.setItem("notifications", JSON.stringify(formattedNotifications));
      }
    } catch (error) {
      console.error("Error loading notifications from server:", error);
    }
  }, [jwt]);

  useEffect(() => {
    if (!jwt || !user) {
      return;
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTimeout(() => {
      loadNotificationsFromServer();
    }, 0);

    const API_URL =
      process.env.NEXT_PUBLIC_STRAPI_API_URL?.replace("/api", "") ||
      "http://localhost:1337";

    console.log("Connecting to socket:", `${API_URL}/realtime/socket.io`);

    const newSocket = io(API_URL, {
      path: "/realtime/socket.io",
      transports: ["websocket", "polling"],
      auth: {
        token: jwt,
      },
    });

    socketRef.current = newSocket;

    setTimeout(() => {
      setSocket(newSocket);
    }, 0);

    newSocket.on("connect", () => {
      console.log("Socket connected");
      isConnectedRef.current = true;
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      isConnectedRef.current = false;
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    newSocket.on("notification", (data: Notification) => {
      console.log("Notification received:", data);
      addNotification(data);
    });

    newSocket.on(
      "realtime:connected",
      (data: {
        ok: boolean;
        userId: number;
        role: string;
        connectedAt: string;
      }) => {
        console.log("Realtime connected:", data);
        setRealtimeConfig({
          enabled: true,
          provider: "socket.io",
          path: "/realtime/socket.io",
          transports: ["websocket", "polling"],
          auth: {
            type: "jwt",
            handshakeField: "auth.token",
            fallbackHeader: "Authorization: Bearer <jwt>",
          },
          events: {
            connected: "realtime:connected",
            notification: "notification",
            chat: {
              joined: "chat.joined",
              left: "chat.left",
              created: "chat.created",
              message: "chat.message.new",
              messageRead: "chat.message.read",
              orderStatusChanged: "chat.order.status_changed",
            },
          },
        });
      },
    );

    newSocket.on("chat.message.new", (data: ChatMessage) => {
      console.log("New chat message received:", data);
      chatMessageCallbacksRef.current.forEach((callback) => {
        callback(data);
      });
    });

    newSocket.on("chat.message.read", (data: { chatId: number; messageId: number }) => {
      console.log("Chat message read:", data);
      chatReadCallbacksRef.current.forEach((callback) => {
        callback(data);
      });
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [jwt, user, addNotification, loadNotificationsFromServer]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        realtimeConfig,
        onNotification,
        onNewChatMessage,
        onChatRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
