const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface QuoteRequestResponse {
  ok: boolean;
  data: {
    total: number;
    filters: {
      status: string[];
      limit: number;
    };
    requests: QuoteRequest[];
  };
}

export interface QuoteRequest {
  id: number;
  documentId: string;
  status: "sent" | "pending" | "cancelled" | "completed";
  deliveryPreference: "pickup" | "delivery";
  tokenCost: number;
  matchedProvidersCount: number;
  quotesReceived: number;
  lastQuoteAt: string | null;
  latestQuoteAt: string | null;
  createdAt: string;
  updatedAt: string;
  vehicle: {
    id: number;
    brand: string;
    model: string;
    year: number;
    version: string;
    engine: string;
  };
  location: {
    id: number;
    name: string;
    state: string;
    municipality: string;
    address: string;
  };
  items: QuoteItem[];
  matchingSummary: {
    total: number;
    pending: number;
    viewed: number;
    quoted: number;
    rejected: number;
  };
}

export interface QuoteItem {
  id: number;
  productName: string;
  quantity: number;
  oemCode: string | null;
  description: string | null;
  conditionPreferred: string;
  category: {
    name: string;
    parent: {
      name: string;
    };
  };
  image: {
    url: string;
  } | null;
}

export async function getMyRequests(
  jwt: string,
  status: string = "sent",
): Promise<QuoteRequestResponse> {
  try {
    const params = status ? `?status=${status}` : "";
    const res = await fetch(`${API_URL}/quote-requests/me${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Error al obtener las solicitudes"
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getMyRequests:", error);
    throw error;
  }
}
