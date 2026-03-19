const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface OrderItem {
  quoteId: number;
  quoteDocumentId: string;
  productId: number;
  productDocumentId: string;
  requestItemId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  requestDocumentId: string;
  items: OrderItem[];
}

export interface CreateOrderResponse {
  ok: boolean;
  data: {
    orders: {
      documentId: string;
      orderCode: string;
      providerDocumentId: string;
      providerName: string;
      items: {
        productName: string;
        quantity: number;
        price: number;
      }[];
      total: number;
    }[];
  };
  message?: string;
}

export async function createOrdersFromComparison(
  jwt: string,
  data: CreateOrderRequest
): Promise<CreateOrderResponse> {
  try {
    const res = await fetch(`${API_URL}/orders/client/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
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
