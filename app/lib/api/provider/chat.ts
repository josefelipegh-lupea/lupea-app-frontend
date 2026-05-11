const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ChatMessage {
  id: number;
  documentId: string;
  sender: {
    id: number;
    username: string;
    role: "client" | "provider" | "system";
  };
  senderRole: "client" | "provider" | "system";
  messageType: "text" | "image" | "file" | "payment_proof" | "system";
  targetRole?: "client" | "provider" | "all";
  content: string;
  status: "sent" | "delivered" | "read";
  deliveredAt: string | null;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachment: {
    id: number;
    documentId: string;
    url: string;
    name: string;
    mime: string;
    size: number;
  } | null;
}

export interface ChatParticipant {
  id: number;
  documentId: string;
  name: string;
  type: "client" | "provider";
  avatar?: string;
}

export interface ChatOrder {
  id: number | null;
  documentId: string | null;
  orderCode: string | null;
  status: string | null;
  subtotal: number | null;
  chatEnabled: boolean;
  contactInfoVisible: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ChatListItem {
  id: number;
  documentId: string;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  order: ChatOrder;
  participants: {
    customer: {
      id: number;
      username: string;
      email: string | null;
    };
    provider: {
      id: number;
      documentId: string;
      businessName: string;
      username: string;
      email: string | null;
      contact: {
        email: string;
        phone: string;
        address: string;
      } | null;
      location: {
        id: number;
        name: string;
        state: string;
        parish: string;
        municipality: string;
      } | null;
    };
  };
}

export async function getMyChatsAsProvider(jwt: string): Promise<{
  ok: boolean;
  data: {
    total: number;
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
    chat: ChatListItem;
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
    chat: ChatListItem;
    total: number;
    messages: ChatMessage[];
  };
}> {
  try {
    const res = await fetch(
      `${API_URL}/chats/${chatId}/messages?limit=${limit}`,
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
  message: string;
  data: {
    chat: {
      id: number;
      lastMessagePreview: string;
    };
    message: ChatMessage;
  };
}> {
  try {
    const formData = new FormData();
    formData.append("content", content);

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
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

export async function sendMessageWithAttachmentAsProvider(
  jwt: string,
  chatId: string,
  content: string,
  file: File,
): Promise<{
  ok: boolean;
  message: string;
  data: {
    chat: {
      id: number;
      lastMessagePreview: string;
    };
    message: ChatMessage;
  };
}> {
  try {
    const formData = new FormData();
    if (content.trim()) {
      formData.append("content", content);
    }
    formData.append("attachment", file);

    const res = await fetch(`${API_URL}/chats/${chatId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al enviar el mensaje");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in sendMessageWithAttachmentAsProvider:", error);
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
