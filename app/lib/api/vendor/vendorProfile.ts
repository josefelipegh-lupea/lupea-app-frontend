const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface BaseEntity {
  id: number;
  documentId: string;
  name: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  icon: string | null;
}

export interface ProviderProfile {
  id: number;
  documentId: string;
  username: string;
  email: string;
  businessName: string;
  state: string;
  city: string;
  status: string;
  termsAccepted: boolean;
  mainCategories: Category[];
}

export interface UpdateProviderProfileDTO {
  businessName: string;
  phone: string;
  whatsapp: string;
  brands: number[];
  mainCategories: number[];
  paymentMethods: string[];
  warrantyPolicy?: string;
  returnPolicy?: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  shippingCarriers: string[];
  termsAccepted: boolean;
}

export interface ProviderProfileData {
  id: number;
  documentId: string;
  businessName: string;
  status: string;
  termsAccepted: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  locale: string | null;
  phone: string;
  paymentMethods: string[];
  warrantyPolicy: string;
  returnPolicy: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
}

// 3. La respuesta completa del API
export interface UpdateProviderResponse {
  ok: boolean;
  message: string;
  data: ProviderProfileData;
}

export async function getProviderProfile(
  jwt: string
): Promise<ProviderProfile> {
  const res = await fetch(`${API_URL}/provider-profiles/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "No se pudo obtener el perfil del proveedor"
    );
  }

  return data;
}

export async function updateProviderProfile(
  jwt: string,
  profileData: UpdateProviderProfileDTO
): Promise<UpdateProviderResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || "Error al actualizar el perfil del proveedor"
    );
  }

  return data;
}

export async function uploadProviderDocument(
  jwt: string,
  type: string,
  file: File
): Promise<{ message: string; success: boolean }> {
  const formData = new FormData();
  formData.append("document", file);

  const res = await fetch(`${API_URL}/provider-profiles/me/documents/${type}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.error?.message || `Error al subir el documento ${type}`
    );
  }

  return data;
}
