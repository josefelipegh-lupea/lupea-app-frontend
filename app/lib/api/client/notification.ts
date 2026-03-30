const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface Notification {
  notificationsEnabled: boolean;
}

export interface ServerNotification {
  id: number;
  documentId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsListResponse {
  ok: boolean;
  data: {
    total: number;
    filters: {
      limit: number;
      isRead: boolean | null;
    };
    notifications: ServerNotification[];
  };
}

export interface NotificationResponse {
  ok: boolean;
  message: string;
  data: Notification[];
}

export async function getNotifications(
  jwt: string,
  limit: number = 50,
  isRead: boolean | null = null
): Promise<NotificationsListResponse> {
  try {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    if (isRead !== null) {
      params.append("isRead", isRead.toString());
    }

    const res = await fetch(`${API_URL}/notifications/me?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener las notificaciones");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getNotifications:", error);
    throw error;
  }
}

export async function updateNotification(
  jwt: string,
  notificationsEnabled: boolean
) {
  const res = await fetch(`${API_URL}/client-profiles/me/notifications`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ notificationsEnabled }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Error al actualizar");
  return data;
}

export interface MarkNotificationsReadRequest {
  all: boolean;
  ids?: number[];
  documentIds?: string[];
}

export async function markNotificationsAsRead(
  jwt: string,
  data: MarkNotificationsReadRequest
): Promise<{ ok: boolean; message: string }> {
  try {
    const res = await fetch(`${API_URL}/notifications/me/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.error?.message || "Error al marcar como leído");
    }

    return response;
  } catch (error) {
    console.error("Fetch error in markNotificationsAsRead:", error);
    throw error;
  }
}
