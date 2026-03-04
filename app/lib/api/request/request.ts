const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface StrapiImage {
  id: number;
  documentId: string;
  url: string;
  name?: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface CreateQuoteItemPayload {
  categoryId: number;
  productName: string;
  quantity: number;
  oemCode?: string;
  preferredBrand?: string;
  conditionPreferred: string;
  description?: string;
  imageId?: number;
}

export interface CreateQuoteRequestPayload {
  vehicleId: number;
  locationId: number;
  deliveryPreference: "pickup" | "delivery";
  items: CreateQuoteItemPayload[];
}

export interface QuoteItemResponse {
  id: number;
  documentId: string;
  productName: string;
  quantity: number;
  oemCode: string;
  preferredBrand: string;
  conditionPreferred: string;
  description: string;
  createdAt: string;
  category: Category;
  image?: StrapiImage;
}

export interface QuoteRequestResponse {
  ok: boolean;
  message: string;
  data: {
    request: {
      id: number;
      documentId: string;
      deliveryPreference: "pickup" | "delivery";
      status: string;
      tokenCost: number;
      createdAt: string;
      updatedAt: string;
    };
    items: QuoteItemResponse[];
    tokens: {
      debited: number;
      remaining: number;
    };
  };
}

export interface UploadImageResponse {
  ok: boolean;
  message: string;
  data: {
    image: {
      id: number;
      url: string;
      name: string;
      mime: string;
      size: number;
    };
  };
}

export interface DeleteImageResponse {
  ok: boolean;
  message: string;
}

export async function createQuoteRequest(
  jwt: string,
  payload: CreateQuoteRequestPayload
): Promise<QuoteRequestResponse> {
  const res = await fetch(`${API_URL}/quote-requests/me`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Error al crear solicitud");

  return data;
}

export async function uploadQuoteItemImage(
  jwt: string,
  file: File
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/quote-requests/me/items/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Error al subir la imagen");

  return data;
}

export async function deleteQuoteItemImage(
  jwt: string,
  imageId: number
): Promise<DeleteImageResponse> {
  const res = await fetch(
    `${API_URL}/quote-requests/me/items/images/${imageId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await res.json();
  if (!res.ok)
    throw new Error(data.error?.message || "Error al eliminar la imagen");

  return data;
}
