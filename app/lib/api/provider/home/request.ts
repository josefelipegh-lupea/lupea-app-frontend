const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ProviderQuoteRequestResponse {
  ok: boolean;
  data: {
    providerProfile: {
      id: number;
      documentId: string;
      businessName: string;
      status: string;
    };
    total: number;
    filters: {
      matchStatus: string[];
      requestStatus: string[];
      limit: number;
    };
    requests: ProviderQuoteRequest[];
  };
}

export interface ProviderQuoteRequest {
  id: number;
  documentId: string;
  status: "pending" | "quoted" | "accepted" | "rejected" | "expired";
  score: number;
  locationScope: string;
  criteria: {
    location: {
      scope: string;
      client: {
        state: string;
        parish: string;
        municipality: string;
      };
      reason: string;
      providerLocation: {
        id: number;
        name: string;
        state: string;
        parish: string;
        municipality: string;
      };
    };
    logistics: {
      hasStorePickup: boolean;
      hasLocalDelivery: boolean;
      deliveryPreference: string;
      hasNationalDelivery: boolean;
    };
    totalItems: number;
    vehicleBrand: {
      id: number;
      name: string;
      reason: string;
    };
    matchedItemCount: number;
    matchedCategoryIds: number[];
    matchedCategoryNames: string[];
  };
  rejectionReason: string | null;
  rejectionNote: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  request: {
    id: number;
    documentId: string;
    status: string;
    deliveryPreference: string;
    tokenCost: number;
    createdAt: string;
    updatedAt: string;
    vehicle: {
      id: number;
      documentId: string;
      brand: string;
      brandMaster: string | null;
      model: string;
      year: number;
      version: string;
      engine: string;
    };
    location: {
      id: number;
      documentId: string;
      name: string;
      type: string;
      state: string;
      municipality: string;
      parish: string;
      address: string;
      exactAddress: string;
      latitude: number;
      longitude: number;
      placeId: string;
    };
    items: {
      id: number;
      documentId: string;
      productName: string;
      quantity: number;
      oemCode: string | null;
      preferredBrand: string | null;
      description: string | null;
      conditionPreferred: string;
      category: {
        id: number;
        documentId: string;
        name: string;
        slug: string;
        parent: {
          id: number;
          documentId: string;
          name: string;
          slug: string;
        };
      };
      image: string | null;
    }[];
    client: {
      id: number;
      username: string;
    };
  };
}

export async function getProviderRequests(
  jwt: string
): Promise<ProviderQuoteRequestResponse> {
  try {
    const res = await fetch(`${API_URL}/quote-requests/provider/me`, {
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
    console.error("Fetch error in getProviderRequests:", error);
    throw error;
  }
}

export async function getProviderRequestById(
  jwt: string,
  documentId: string
): Promise<{ ok: boolean; data: ProviderQuoteRequest | null }> {
  try {
    const res = await fetch(
      `${API_URL}/quote-requests/provider/me/${documentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Error al obtener la solicitud"
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderRequestById:", error);
    throw error;
  }
}

export async function getProviderRequestByNumericId(
  jwt: string,
  numericId: number
): Promise<{ ok: boolean; data: { id: number; documentId: string } | null }> {
  try {
    const res = await fetch(
      `${API_URL}/quote-requests/provider/me/by-id/${numericId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, data: null };
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderRequestByNumericId:", error);
    return { ok: false, data: null };
  }
}
