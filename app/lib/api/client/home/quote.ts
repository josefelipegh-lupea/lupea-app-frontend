const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ClientQuoteResponse {
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
    total: number;
    summary: {
      totalQuotes: number;
      activeQuotes: number;
      acceptedQuotes: number;
      expiredQuotes: number;
      rejectedQuotes: number;
      cancelledQuotes: number;
      providersCount: number;
      lastQuoteAt: string | null;
      canCompare: boolean;
      canViewDetail: boolean;
      suggestedPrimaryAction: string;
      coverage: {
        requestedItemsCount: number;
        quotedItemsCount: number;
        uncoveredItemsCount: number;
        coverageRatio: number;
        coveragePercent: number;
        coverageStatus: string;
      };
    };
    featuredQuote: ClientQuote | null;
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
    quotes: ClientQuote[];
  };
}

export interface ClientQuote {
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

export async function getClientRequestQuotes(
  jwt: string,
  requestDocumentId: string,
): Promise<ClientQuoteResponse> {
  try {
    const res = await fetch(
      `${API_URL}/quotes/client/requests/${requestDocumentId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error?.message || "Error al obtener las cotizaciones",
      );
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getClientRequestQuotes:", error);
    throw error;
  }
}

export async function getClientQuoteById(
  jwt: string,
  quoteId: string,
): Promise<{ ok: boolean; data: ClientQuote }> {
  try {
    const res = await fetch(`${API_URL}/quotes/client/me/${quoteId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Error al obtener la cotización");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getClientQuoteById:", error);
    throw error;
  }
}
