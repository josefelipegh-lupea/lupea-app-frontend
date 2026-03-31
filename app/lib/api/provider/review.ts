const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ReviewRating {
  rating: number;
  comment: string;
}

export interface RatingDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
}

export interface ProviderReputation {
  averageRating: number;
  reviewCount: number;
  reputationScore: number;
  reputationLevel: string;
  satisfactionRate: number;
  completedOrdersCount: number;
  totalOrdersCount: number;
  completionRate: number;
  completionRatePercent: number;
  quotedMatchesCount: number;
  totalMatchesCount: number;
  responseRate: number;
  responseRatePercent: number;
  ratingDistribution: RatingDistribution;
}

export interface ProviderSummary {
  id: number;
  documentId: string;
  businessName: string;
  username: string;
}

export interface ProviderReputationSummary {
  provider: ProviderSummary;
  reputation: ProviderReputation;
}

export interface RecentReview {
  id: number;
  documentId: string;
  rating: number;
  comment: string;
  createdAt: string;
  orderCode: string;
  clientName: string;
}

export interface MyProviderReputation {
  provider: ProviderSummary & { email: string };
  reputation: ProviderReputation & { recentReviews: RecentReview[] };
}

export async function createProviderReview(
  jwt: string,
  orderId: string,
  data: ReviewRating
): Promise<{
  ok: boolean;
  message: string;
  data?: {
    review: {
      id: number;
      documentId: string;
      rating: number;
      comment: string;
    };
  };
}> {
  try {
    const res = await fetch(`${API_URL}/provider-reviews/orders/${orderId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(data),
    });

    const response = await res.json();

    if (!res.ok) {
      throw new Error(response.error?.message || "Error al crear la evaluación");
    }

    return response;
  } catch (error) {
    console.error("Fetch error in createProviderReview:", error);
    throw error;
  }
}

export async function getProviderReputationSummary(
  jwt: string,
  providerProfileId: string
): Promise<{
  ok: boolean;
  data: ProviderReputationSummary;
}> {
  try {
    const res = await fetch(
      `${API_URL}/provider-reviews/providers/${providerProfileId}/summary`,
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
      throw new Error(data.error?.message || "Error al obtener la reputación");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getProviderReputationSummary:", error);
    throw error;
  }
}

export async function getMyProviderReputation(
  jwt: string,
  limit: number = 10
): Promise<{
  ok: boolean;
  data: MyProviderReputation;
}> {
  try {
    const res = await fetch(
      `${API_URL}/provider-reviews/provider/me?limit=${limit}`,
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
      throw new Error(data.error?.message || "Error al obtener mi reputación");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getMyProviderReputation:", error);
    throw error;
  }
}

export async function getOrderReview(
  jwt: string,
  orderId: string
): Promise<{
  ok: boolean;
  data?: {
    review: {
      id: number;
      documentId: string;
      rating: number;
      comment: string;
      order: {
        id: number;
        documentId: string;
        orderCode: string;
        status: string;
      };
    };
  };
}> {
  try {
    const res = await fetch(`${API_URL}/provider-reviews/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false };
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getOrderReview:", error);
    return { ok: false };
  }
}