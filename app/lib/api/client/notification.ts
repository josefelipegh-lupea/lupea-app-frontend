const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface Notification {
  notificationsEnabled: boolean;
}
export interface NotificationResponse {
  ok: boolean;
  message: string;
  data: Notification[];
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
