const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ProviderQuoteResponse {
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
      status: string[];
      limit: number;
    };
    quotes: ProviderQuote[];
  };
}

export interface ProviderQuote {
  id: number;
  documentId: string;
  quoteCode: string;
  status: string;
  comparisonStatus: string;
  isExpired: boolean;
  priceTotal: number;
  deliveryTime: string;
  validityDate: string;
  noteGeneral: string | null;
  createdAt: string;
  updatedAt: string;
  provider: {
    id: number;
    documentId: string;
    businessName: string;
    username: string;
    paymentMethods: string[];
    warrantyPolicy: string | null;
    returnPolicy: string | null;
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
    client: {
      id: number;
      username: string;
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
  items: {
    id: number;
    documentId: string;
    productName: string;
    quantity: number;
    offeredBrand: string;
    availableQuantity: number;
    unitPrice: number;
    subtotal: number;
    warranty: string | null;
    notes: string | null;
    photo: string | null;
    requestItem: {
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
    };
  }[];
  match: {
    id: number;
    documentId: string;
    status: string;
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
  };
}

export async function getProviderQuotes(
  jwt: string,
  status: string = "sent,viewed",
  limit: number = 20
): Promise<ProviderQuoteResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/provider/me?status=${status}&limit=${limit}`,
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
        data.error?.message || "Error al obtener las cotizaciones"
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderQuotes:", error);
    throw error;
  }
}

export interface SubmitQuotePayload {
  deliveryTime: string;
  validityDate: string;
  paymentMethods: string[];
  deliveryMethods: string[];
  warrantyPolicy?: string;
  returnPolicy?: string;
  noteGeneral?: string;
  items: {
    requestItemId: number;
    offeredBrand?: string;
    availableQuantity?: number;
    unitPrice: number;
    warranty?: string;
    notes?: string;
  }[];
}

export interface SubmitQuoteResponse {
  ok: boolean;
  data?: ProviderQuote;
  error?: {
    message: string;
  };
}

export interface QuoteDetailResponse {
  ok: boolean;
  data: ProviderQuote & {
    formContext?: {
      requestHeader: {
        id: number;
        documentId: string;
        status: string;
        createdAt: string;
        clientName: string;
      };
      providerInfo: {
        profileId: number;
        businessName: string;
        location: {
          state: string;
          municipality: string;
          parish: string;
          address: string;
        };
      };
      progress: {
        quotedItemsCount: number;
        quotedVariantsCount: number;
        totalRequestItemsCount: number;
      };
      commercialDefaults: {
        paymentMethods: string[];
        warrantyPolicy: string;
        returnPolicy: string;
        hasStorePickup: boolean;
        hasLocalDelivery: boolean;
        hasNationalDelivery: boolean;
        nationalCarriers: string[];
      };
    };
  };
}

export async function getQuoteDetail(
  jwt: string,
  quoteId: string,
  includeFormContext: boolean = true
): Promise<QuoteDetailResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/provider/me/${quoteId}?includeFormContext=${includeFormContext}`,
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
        data.error?.message || "Error al obtener el detalle de la cotización"
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getQuoteDetail:", error);
    throw error;
  }
}

export async function submitQuote(
  jwt: string,
  matchId: string,
  quoteMode: string,
  payload: SubmitQuotePayload
): Promise<SubmitQuoteResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/provider/matches/${matchId}?mode=${quoteMode}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al enviar la cotización");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in submitQuote:", error);
    throw error;
  }
}

export interface ProviderQuoteHistoryResponse {
  ok: boolean;
  data: {
    quotes: ProviderQuote[];
    pagination: {
      total: number;
      page: number;
      pageSize: number;
      pageCount: number;
    };
  };
}

export async function getProviderQuoteHistory(
  jwt: string,
  page: number = 1,
  limit: number = 20,
): Promise<ProviderQuoteHistoryResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/provider/history?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener el historial de cotizaciones");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderQuoteHistory:", error);
    throw error;
  }
}
