const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface SelectedItem {
  quoteItemId: number;
}

export interface CreateOrderRequest {
  selectedItems: SelectedItem[];
}

export interface CreateOrderResponse {
  ok: boolean;
  message: string;
  data: {
    request: {
      id: number;
      documentId: string;
      status: string;
    };
    generatedOrdersCount: number;
    selectedProductsCount: number;
    totalAmount: number;
    orders: OrderData[];
  };
}

export interface OrderData {
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
  items: OrderItemData[];
}

export interface OrderItemData {
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

export async function createOrdersFromComparison(
  jwt: string,
  requestDocumentId: string,
  selectedItems: SelectedItem[]
): Promise<CreateOrderResponse> {
  try {
    const res = await fetch(`${API_URL}/orders/client/requests/${requestDocumentId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ selectedItems }),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(
        response.error?.message || "Error al generar las órdenes"
      );
    }

    return response;
  } catch (error) {
    console.error("Fetch error in createOrdersFromComparison:", error);
    throw error;
  }
}

export async function getClientOrders(
  jwt: string,
  status?: string
): Promise<{
  ok: boolean;
  data: {
    orders: {
      id: number;
      documentId: string;
      orderCode: string;
      status: string;
      total: number;
      itemsCount: number;
      provider: {
        businessName: string;
      };
      createdAt: string;
    }[];
  };
}> {
  try {
    const url = new URL(`${API_URL}/orders/client`);
    if (status) url.searchParams.append("status", status);

    const res = await fetch(url.toString(), {
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
    console.error("Fetch error in getClientOrders:", error);
    throw error;
  }
}

export async function getRequestOrders(
  jwt: string,
  requestDocumentId: string
): Promise<{
  ok: boolean;
  data: {
    orders: OrderData[];
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/client/requests/${requestDocumentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener las órdenes del request");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getRequestOrders:", error);
    throw error;
  }
}

export async function getMyClientOrders(jwt: string): Promise<{
  ok: boolean;
  data: {
    total: number;
    filters: {
      status: string[];
      limit: number;
    };
    orders: OrderData[];
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/client/me`, {
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
    console.error("Fetch error in getMyClientOrders:", error);
    throw error;
  }
}

export async function getOrderById(jwt: string, orderId: string): Promise<{
  ok: boolean;
  data: {
    order: OrderData;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/client/me/${orderId}`, {
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
    console.error("Fetch error in getOrderById:", error);
    throw error;
  }
}

export async function cancelClientOrder(
  jwt: string,
  orderId: string,
  note?: string,
): Promise<{
  ok: boolean;
  data: {
    order: OrderData;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/client/me/${orderId}/cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ note }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al cancelar la orden");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in cancelClientOrder:", error);
    throw error;
  }
}

export async function getQuoteOrder(
  jwt: string,
  quoteDocumentId: string
): Promise<{
  ok: boolean;
  data: {
    order: OrderData | null;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/orders/client/me?limit=100`, {
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

    const order = data.data.orders.find(
      (o: OrderData) => o.quote?.documentId === quoteDocumentId
    );

    return {
      ok: true,
      data: {
        order: order || null,
      },
    };
  } catch (error) {
    console.error("Fetch error in getQuoteOrder:", error);
    throw error;
  }
}
