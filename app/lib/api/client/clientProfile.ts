const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export type ClientProfileResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  privacyLevel: string;
  notificationsEnabled: boolean;
  status: string | null;
  tokensAvailable: number;
};

export interface UpdateProfilePayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone: string;
  privacyLevel: string;
}

export async function getClientProfile(
  jwt: string
): Promise<ClientProfileResponse> {
  const res = await fetch(`${API_URL}/client-profiles/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudo obtener el perfil del cliente"
    );
  }

  return data;
}

export async function updateClientProfile(
  jwt: string,
  formData: Partial<ClientProfileResponse>
): Promise<ClientProfileResponse> {
  const res = await fetch(`${API_URL}/client-profiles/me`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const responseData = await res.json();

  if (!res.ok) {
    throw new Error(responseData.message || "Error al actualizar el perfil");
  }

  return responseData.data;
}
