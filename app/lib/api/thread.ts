const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

// ── Thread types ──────────────────────────────────────────────────────────────

export type ThreadStatus = "open" | "read_only";
export type QuestionStatus = "pending" | "answered" | "dismissed" | "expired";
export type QuestionCategory =
  | "part_photo"
  | "oem_code"
  | "engine_version"
  | "side"
  | "accepts_aftermarket"
  | "quantity"
  | "other";

export interface ThreadQuestion {
  id: string;
  category: QuestionCategory;
  categoryLabel: string;
  item: { id: string; name: string } | null;
  content: string;
  status: QuestionStatus;
  createdAt: string;
  isMine: boolean;
  answer: {
    content: string;
    media: { url: string; thumb: string } | null;
    answeredAt: string;
  } | null;
}

export interface BlockedCategory {
  category: QuestionCategory;
  itemId: string | null;
  questionId: string;
}

export interface ThreadPermissions {
  canAsk: boolean;
  canAnswer: boolean;
  remaining: number;
  blockedCategories: BlockedCategory[];
}

export interface RequestThreadData {
  thread: {
    status: ThreadStatus;
    total: number;
    answered: number;
    pending: number;
  };
  questions: ThreadQuestion[];
  permissions: ThreadPermissions;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getRequestThread(
  jwt: string,
  requestDocumentId: string,
): Promise<{ ok: boolean; data: RequestThreadData }> {
  try {
    const res = await fetch(
      `${API_URL}/quote-requests/${requestDocumentId}/thread`,
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
      throw new Error(data.error?.message || "Error al obtener el hilo");
    }

    return data;
  } catch (error) {
    console.error("Fetch error in getRequestThread:", error);
    throw error;
  }
}

export type DismissResult =
  | { ok: true; question: ThreadQuestion }
  | { ok: false; code: string };

export async function dismissThreadQuestion(
  jwt: string,
  requestDocumentId: string,
  messageId: string,
): Promise<DismissResult> {
  try {
    const res = await fetch(
      `${API_URL}/quote-requests/${requestDocumentId}/thread/messages/${messageId}/dismiss`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const code = data?.error?.details?.code ?? "UNKNOWN";
      return { ok: false, code };
    }

    return { ok: true, question: data.data.question };
  } catch (error) {
    console.error("Fetch error in dismissThreadQuestion:", error);
    return { ok: false, code: "UNKNOWN" };
  }
}
