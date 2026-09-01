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

export type AnswerResult =
  | { ok: true; question: ThreadQuestion }
  | { ok: false; code: string };

export type UploadAttachmentResult =
  | { ok: true; image: { id: number; url: string | null; thumb: string | null } }
  | { ok: false; code: string };

const ANSWER_ERROR_MAP: Record<string, string> = {
  THREAD_CLOSED: "Esta solicitud ya no admite respuestas.",
  QUESTION_NOT_PENDING: "Esta pregunta ya fue atendida.",
  QUESTION_NOT_FOUND: "No se encontró la pregunta.",
  INVALID_CONTENT: "Escribe una respuesta (máximo 500 caracteres).",
  INVALID_MEDIA: "No se pudo adjuntar la imagen. Intenta con otra.",
};

export function answerErrorMessage(code: string): string {
  return ANSWER_ERROR_MAP[code] ?? "No se pudo publicar la respuesta. Intenta de nuevo.";
}

export async function answerThreadQuestion(
  jwt: string,
  requestDocumentId: string,
  messageId: string,
  body: { content?: string | null; mediaId?: number | null },
): Promise<AnswerResult> {
  try {
    const res = await fetch(
      `${API_URL}/quote-requests/${requestDocumentId}/thread/messages/${messageId}/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ content: body.content ?? null, mediaId: body.mediaId ?? null }),
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const code = data?.error?.details?.code ?? "UNKNOWN";
      return { ok: false, code };
    }

    return { ok: true, question: data.data.question };
  } catch (error) {
    console.error("Fetch error in answerThreadQuestion:", error);
    return { ok: false, code: "UNKNOWN" };
  }
}

export async function uploadThreadAttachment(
  jwt: string,
  requestDocumentId: string,
  file: File,
): Promise<UploadAttachmentResult> {
  try {
    const form = new FormData();
    form.append("image", file);

    const res = await fetch(
      `${API_URL}/quote-requests/${requestDocumentId}/thread/attachments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: form,
      },
    );

    const data = await res.json();

    if (!res.ok) {
      const code = data?.error?.details?.code ?? "UNKNOWN";
      return { ok: false, code };
    }

    return { ok: true, image: data.data.image };
  } catch (error) {
    console.error("Fetch error in uploadThreadAttachment:", error);
    return { ok: false, code: "UNKNOWN" };
  }
}

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
