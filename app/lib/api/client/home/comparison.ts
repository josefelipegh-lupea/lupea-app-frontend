const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ClientComparisonResponse {
  ok: boolean;
  data: {
    request: {
      id: number;
      documentId: string;
      status: string;
      deliveryPreference: string;
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
    };
    summary: {
      totalQuotes: number;
      activeQuotes: number;
      expiredQuotes: number;
      requestItemsCount: number;
      providersCount: number;
      viewMode: string;
      canCompare: boolean;
      canGenerateOrder: boolean;
      lastQuoteAt: string | null;
    };
    quotes: ComparisonQuote[];
    bestOptionsByRequestItem: {
      requestItemId: number;
      quoteId: number;
      quoteDocumentId: string;
      providerId: number;
      providerDocumentId: string;
      providerName: string;
      productId: number;
      productDocumentId: string;
      price: number;
      availability: string;
      brand: string;
    }[];
  };
}

export interface ComparisonQuote {
  id: number;
  documentId: string;
  quotationCode: string;
  status: string;
  comparisonStatus: string;
  isExpired: boolean;
  provider: {
    id: number;
    documentId: string;
    name: string;
    username: string;
    rating: number;
    reviewCount: number;
    reputationScore: number;
    reputationLevel: string;
    location: {
      id: number;
      name: string;
      state: string;
      parish: string;
      municipality: string;
    };
  };
  paymentMethods: string[];
  deliveryMethods: string[];
  warrantyPolicy: string | null;
  returnPolicy: string | null;
  validity: string;
  deliveryTime: string;
  quoteTotal: number;
  noteGeneral: string | null;
  createdAt: string;
  updatedAt: string;
  products: {
    id: number;
    documentId: string;
    requestItemId: number;
    requestItemDocumentId: string;
    productName: string;
    quantity: number;
    brand: string;
    price: number;
    subtotal: number;
    availability: string;
    warranty: string | null;
    notes: string | null;
    photo: string | null;
    selected: boolean;
    quoteId: number;
    quoteDocumentId: string;
  }[];
}

export async function getClientRequestComparison(
  jwt: string,
  requestDocumentId: string
): Promise<ClientComparisonResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/client/requests/${requestDocumentId}/comparison`,
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
        data.error?.message || "Error al obtener la comparación"
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getClientRequestComparison:", error);
    throw error;
  }
}

export async function rejectQuote(
  jwt: string,
  quoteDocumentId: string
): Promise<{ ok: boolean; message: string }> {
  const res = await fetch(
    `${API_URL}/quotes/client/me/${quoteDocumentId}/reject`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error?.message || "Error al rechazar la cotización");
  }

  return data;
}
