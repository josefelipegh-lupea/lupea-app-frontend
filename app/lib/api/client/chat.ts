const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ChatMessage {
  id: number;
  documentId: string;
  chatId: number;
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

export interface ChatListItem {
  id: number;
  documentId: string;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  participant: ChatParticipant;
  order: ChatOrder;
}

export interface SendMessageRequest {
  content: string;
}

export async function getMyChatsAsClient(
  jwt: string
): Promise<{
  ok: boolean;
  data: {
    chats: ChatListItem[];
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener los chats");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getMyChatsAsClient:", error);
    throw error;
  }
}

export async function getOrderChatAsClient(
  jwt: string,
  orderId: string
): Promise<{
  ok: boolean;
  data: {
    chat: {
      id: number;
      documentId: string;
      status: string;
      order: ChatOrder;
      participant: ChatParticipant;
    };
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener el chat");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getOrderChatAsClient:", error);
    throw error;
  }
}

export async function getChatMessagesAsClient(
  jwt: string,
  chatId: string,
  limit: number = 50
): Promise<{
  ok: boolean;
  data: {
    messages: ChatMessage[];
    hasMore: boolean;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/${chatId}/messages?limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener los mensajes");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getChatMessagesAsClient:", error);
    throw error;
  }
}

export async function sendMessageAsClient(
  jwt: string,
  chatId: string,
  content: string
): Promise<{
  ok: boolean;
  data: {
    message: ChatMessage;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al enviar el mensaje");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in sendMessageAsClient:", error);
    throw error;
  }
}

export async function markChatAsReadAsClient(
  jwt: string,
  chatId: string
): Promise<{
  ok: boolean;
}> {
  try {
    const res = await fetch(`${API_URL}/chats/${chatId}/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Error al marcar como leído");
    }

    return { ok: true };
  } catch (error) {
    console.error("Fetch error in markChatAsReadAsClient:", error);
    throw error;
  }
}

export async function notifyClientPayment(
  jwt: string,
  orderId: string
): Promise<{
  ok: boolean;
  message: string;
}> {
  try {
    const res = await fetch(
      `${API_URL}/orders/client/me/${orderId}/notify-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          content: "Adjunto comprobante de pago para validación",
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Error al notificar el pago"
      );
    }

    return { ok: true, message: data.message || "Pago notificado" };
  } catch (error) {
    console.error("Fetch error in notifyClientPayment:", error);
    throw error;
  }
}
