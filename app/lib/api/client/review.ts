const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface ReviewRating {
  rating: number;
  comment: string;
}

export async function createClientReview(
  jwt: string,
  orderId: string,
  data: ReviewRating,
): Promise<{
  ok: boolean;
  message: string;
}> {
  const res = await fetch(`${API_URL}/client-reviews/orders/${orderId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(data),
  });

  const response = await res.json();

  if (!res.ok) {
    throw new Error(response.error?.message || "Error al crear la evaluacion");
  }

  return response;
}

export async function getClientOrderReview(
  jwt: string,
  orderId: string,
): Promise<{
  ok: boolean;
  data?: {
    exists: boolean;
    review: {
      id: number;
      documentId: string;
      rating: number;
      comment: string | null;
    } | null;
  };
}> {
  try {
    const res = await fetch(`${API_URL}/client-reviews/orders/${orderId}`, {
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
    console.error("Fetch error in getClientOrderReview:", error);
    return { ok: false };
  }
}
