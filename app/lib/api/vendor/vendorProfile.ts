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
  tokensAvailable?: number;
   averageRating?: number;
   reviewCount?: number;
   reputationScore?: number;
   reputationLevel?: string;
   metrics?: {
    requestsReceivedCount: number;
    quotesSentCount: number;
    quotesAcceptedCount: number;
    requestHistory?: Array<{
      month: string;
      count: number;
    }>;
    quoteSentHistory?: Array<{
      month: string;
      count: number;
    }>;
    quoteAcceptedHistory?: Array<{
      month: string;
      count: number;
    }>;
   };
   reputation?: {
    averageRating: number;
    reviewCount: number;
    reputationScore: number;
    reputationLevel: string;
   };
  termsAccepted: boolean;
  mainCategories: Category[];
}

export interface ProviderLocationDTO {
  name: string;
  type: "branch";
  state: string;
  municipality: string;
  parish: string;
  address: string;
  exactAddress?: string;
  latitude: number;
  longitude: number;
  placeId: string;
}

export interface UpdateProviderProfileDTO {
  businessName: string;
  phoneNumber: string;
  mainCategories: number[];
  subcategories: number[];
  brands: number[];
  paymentMethods: string[];
  warrantyPolicy?: string;
  returnPolicy?: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
  termsAccepted: boolean;
  location: ProviderLocationDTO;
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
  phoneNumber: string;
  paymentMethods: string[];
  warrantyPolicy: string;
  returnPolicy: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
}

export interface UpdateProviderResponse {
  ok: boolean;
  message: string;
  data: ProviderProfileData;
}

export interface CommercialData {
  id: number;
  documentId: string;
  status: string;
  username: string;
  email: string;
  businessName: string;
  phoneNumber: string;
  editableFields: {
    username: boolean;
    email: boolean;
    businessName: boolean;
    phoneNumber: boolean;
  };
}

export interface CommercialDataResponse {
  ok: boolean;
  data: CommercialData;
}

export interface UpdateCommercialDataDTO {
  businessName: string;
  phoneNumber: string;
}

export interface UpdateClassificationDTO {
  mainCategories: number[];
  subcategories?: number[];
  brands: number[];
}

export interface ClassificationData {
  id: number;
  documentId: string;
  mainCategories: Category[];
  subcategories?: Category[];
  brands: BaseEntity[];
  storefrontPhotos?: string;
}

export interface ClassificationResponse {
  ok: boolean;
  data: ClassificationData;
}

export interface SalesConditionsData {
  id: number;
  documentId: string;
  paymentMethods: string[];
  warrantyPolicy: string;
  returnPolicy: string;
}

export interface SalesConditionsResponse {
  ok: boolean;
  message?: string;
  data: SalesConditionsData;
}

export interface UpdateSalesConditionsDTO {
  paymentMethods: string[];
  warrantyPolicy: string;
  returnPolicy: string;
}

export interface LogisticsData {
  id: number;
  documentId: string;
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
}

export interface LogisticsResponse {
  ok: boolean;
  message?: string;
  data: LogisticsData;
}

export interface UpdateLogisticsDTO {
  hasStorePickup: boolean;
  hasLocalDelivery: boolean;
  hasNationalDelivery: boolean;
  nationalCarriers: string[];
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

export async function getCommercialData(
  jwt: string
): Promise<CommercialDataResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/commercial-data`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.message || "Error al obtener datos comerciales"
    );
  return data;
}

export async function updateCommercialData(
  jwt: string,
  payload: UpdateCommercialDataDTO
): Promise<CommercialDataResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/commercial-data`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok)
    throw new Error(
      data.error?.message || "Error al actualizar datos comerciales"
    );
  return data;
}

export async function getClassificationData(
  jwt: string
): Promise<ClassificationResponse> {
  const res = await fetch(
    `${API_URL}/provider-profiles/me/commercial-information`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Error al obtener clasificación");
  return data;
}

export async function updateClassificationData(
  jwt: string,
  payload: UpdateClassificationDTO
): Promise<{ ok: boolean; message?: string }> {
  const res = await fetch(
    `${API_URL}/provider-profiles/me/commercial-information`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(payload),
    }
  );
  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Error al actualizar clasificación");
  return data;
}

export async function getSalesConditions(
  jwt: string
): Promise<SalesConditionsResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/sales-conditions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data: SalesConditionsResponse = await res.json();
  if (!res.ok) throw new Error("Error al obtener condiciones de venta");
  return data;
}

export async function updateSalesConditions(
  jwt: string,
  payload: UpdateSalesConditionsDTO
): Promise<SalesConditionsResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/sales-conditions`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });
  const data: SalesConditionsResponse = await res.json();
  if (!res.ok) throw new Error("Error al actualizar condiciones de venta");
  return data;
}

export async function getLogisticsData(
  jwt: string
): Promise<LogisticsResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/logistics`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
  });
  const data: LogisticsResponse = await res.json();
  if (!res.ok) throw new Error("Error al obtener datos de logística");
  return data;
}

export async function updateLogisticsData(
  jwt: string,
  payload: UpdateLogisticsDTO
): Promise<LogisticsResponse> {
  const res = await fetch(`${API_URL}/provider-profiles/me/logistics`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });
  const data: LogisticsResponse = await res.json();
  if (!res.ok) throw new Error("Error al actualizar logística");
  return data;
}
