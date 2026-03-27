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
  const { jwt, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [realtimeConfig, setRealtimeConfig] = useState<RealtimeConfig | null>(
    null,
  );

  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const notificationCallbacksRef = useRef<
    Set<(notification: Notification) => void>
  >(new Set());

  const unreadCount = notifications.filter((n) => !n.read).length;

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
    setNotifications((prev) => [notification, ...prev]);

    notificationCallbacksRef.current.forEach((callback) => {
      callback(notification);
    });

    toast(notification.message, {
      icon: <IconsApp.Notification />,
      duration: 10000,
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  useEffect(() => {
    if (!jwt || !user) {
      return;
    }

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

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [jwt, user, addNotification]);

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
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
