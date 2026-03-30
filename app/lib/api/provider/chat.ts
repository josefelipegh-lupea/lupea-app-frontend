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

export async function getMyChatsAsProvider(jwt: string): Promise<{
  ok: boolean;
  data: {
    chats: ChatListItem[];
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/provider/me`, {
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
    console.error("Fetch error in getMyChatsAsProvider:", error);
    throw error;
  }
}

export async function getOrderChatAsProvider(
  jwt: string,
  orderId: string,
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
    console.error("Fetch error in getOrderChatAsProvider:", error);
    throw error;
  }
}

export async function getChatMessagesAsProvider(
  jwt: string,
  chatId: string,
  limit: number = 50,
): Promise<{
  ok: boolean;
  data: {
    messages: ChatMessage[];
    hasMore: boolean;
  };
}> {
  try {
    const res = await fetch(
      `${API_URL}/chats/provider/${chatId}/messages?limit=${limit}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener los mensajes");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getChatMessagesAsProvider:", error);
    throw error;
  }
}

export async function sendMessageAsProvider(
  jwt: string,
  chatId: string,
  content: string,
): Promise<{
  ok: boolean;
  data: {
    message: ChatMessage;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/chats/provider/${chatId}/messages`, {
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
    console.error("Fetch error in sendMessageAsProvider:", error);
    throw error;
  }
}

export async function markChatAsReadAsProvider(
  jwt: string,
  chatId: string,
): Promise<{
  ok: boolean;
}> {
  try {
    const res = await fetch(`${API_URL}/chats/provider/${chatId}/read`, {
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
    console.error("Fetch error in markChatAsReadAsProvider:", error);
    throw error;
  }
}

export async function confirmProviderPayment(
  jwt: string,
  orderId: string,
  note: string,
): Promise<{
  ok: boolean;
  message: string;
  data?: {
    order: {
      id: number;
      documentId: string;
      orderCode: string;
      status: string;
      subtotal: number;
    };
  };
}> {
  try {
    const res = await fetch(
      `${API_URL}/orders/provider/me/${orderId}/confirm-payment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ note }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al confirmar el pago");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in confirmProviderPayment:", error);
    throw error;
  }
}
