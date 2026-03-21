const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ProviderOrderData {
  id: number;
  documentId: string;
  orderCode: string;
  status: string;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  chatEnabled: boolean;
  contactInfoVisible: boolean;
  provider: {
    id: number;
    documentId: string;
    businessName: string;
    username: string;
    averageRating: number;
    reviewCount: number;
    reputationScore: number;
    reputationLevel: string;
    contact: {
      email: string;
      phone: string;
      address: string;
    };
    location: {
      id: number;
      name: string;
      state: string;
      parish: string;
      municipality: string;
    };
  };
  request: {
    id: number;
    documentId: string;
    status: string;
  };
  client?: {
    username: string;
    contact?: {
      email: string;
      phone: string;
      address: string;
    };
  };
  quote: {
    id: number;
    documentId: string;
    quoteCode: string;
    deliveryTime: string;
    validityDate: string;
  };
  conditions: {
    paymentMethods: string[];
    deliveryMethods: string[];
    deliveryTime: string;
    warrantyPolicy: string;
    returnPolicy: string;
    noteGeneral: string;
  };
  chat: {
    id: number;
    documentId: string;
    status: string;
    lastMessageAt: string;
    lastMessagePreview: string;
  };
  providerReview: null;
  items: ProviderOrderItem[];
}

export interface ProviderOrderItem {
  id: number;
  documentId: string;
  quoteItemId: number;
  quoteItemDocumentId: string;
  requestItemId: number;
  requestItemDocumentId: string;
  productName: string;
  quantity: number;
  brand: string;
  price: number;
  subtotal: number;
  availability: string;
  warranty: string;
  notes: string;
  photo: null;
}

export async function getProviderOrders(jwt: string): Promise<{
  ok: boolean;
  data: {
    total: number;
    filters: {
      status: string[];
      limit: number;
    };
    orders: ProviderOrderData[];
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/provider/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener las órdenes");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderOrders:", error);
    throw error;
  }
}

export async function getProviderOrderById(jwt: string, orderId: string): Promise<{
  ok: boolean;
  data: {
    order: ProviderOrderData;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/provider/me/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener la orden");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderOrderById:", error);
    throw error;
  }
}
