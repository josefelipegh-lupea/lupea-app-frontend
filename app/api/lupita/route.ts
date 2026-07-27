import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Modelos free de OpenRouter, en orden de preferencia. Se intentan en cadena:
// si uno agota su cuota free / falla, se pasa al siguiente. Buenos en español.
// Para migrar a Claude: MODELS = ["anthropic/claude-haiku-4.5"]
const MODELS = [
  "openai/gpt-oss-20b:free",
  "nvidia/nemotron-nano-9b-v2:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen3-next-80b-a3b-instruct:free",
  "google/gemma-4-31b-it:free",
  "openai/gpt-oss-120b:free",
];

const MAX_MESSAGE_LENGTH = 1000;

const FALLBACK_REPLY =
  "Se me cruzaron los cables un segundo. Inténtalo de nuevo, aquí sigo.";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionContext {
  firstName?: string;
  // null = aún cargando; [] = vacío de verdad; undefined = no enviado
  vehicles?: Array<{ id: number; label: string }> | null;
  locations?: Array<{ id: number; label: string }> | null;
  saldo?: {
    available?: number;
    total?: number;
    nextRenewal?: string;
  };
}

// La base de conocimiento se lee una sola vez por proceso.
let cachedKnowledge: string | null = null;

function loadKnowledge(): string {
  if (cachedKnowledge !== null) return cachedKnowledge;

  const knowledgeDir = path.join(
    process.cwd(),
    "agent-knowledge",
    "lupita",
  );

  const files = fs
    .readdirSync(knowledgeDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  cachedKnowledge = files
    .map((file) => fs.readFileSync(path.join(knowledgeDir, file), "utf-8"))
    .join("\n\n---\n\n");

  return cachedKnowledge;
}

function formatList(
  items: Array<{ id: number; label: string }> | null | undefined,
  emptyLabel: string,
): string {
  // null/undefined = todavía cargando; no afirmar que no hay nada
  if (items === null || items === undefined) {
    return "(cargando, aún sin confirmar; no asumas que no tiene)";
  }

  if (items.length === 0) {
    return emptyLabel;
  }

  return items
    .map((item) => `- id ${item.id}: ${item.label}`)
    .join("\n");
}

function buildContextBlock(context: SessionContext): string {
  const vehicles = formatList(context.vehicles, "ninguno");
  const locations = formatList(context.locations, "ninguna");

  const saldo =
    context.saldo && context.saldo.available !== undefined
      ? `Saldo de lupas: ${context.saldo.available} disponibles de ${context.saldo.total ?? "?"}; renueva ${context.saldo.nextRenewal ?? "s/f"}.`
      : "Saldo de lupas: no disponible en esta sesión.";

  return [
    "CONTEXTO DE ESTA SESIÓN",
    `Usuario: ${context.firstName || "sin nombre"}`,
    `Vehículos guardados:\n${vehicles}`,
    `Direcciones guardadas:\n${locations}`,
    saldo,
    "Usa estos ids para anclar las referencias (no los muestres al Usuario).",
    "Si una lista dice 'ninguno/ninguna', el Usuario aún no tiene guardados y",
    "debes pedir los datos. Habla del saldo como saldo, nunca como escasez, y",
    "menciónalo solo en el resumen de confirmación.",
  ].join("\n");
}

// Instrucciones de formato del resumen final. Van en el system prompt (no en
// la base de conocimiento, que es solo la persona de Lupita).
const SUMMARY_PROTOCOL = [
  "PROTOCOLO DE RESUMEN FINAL",
  "Cuando ya tengas todos los datos obligatorios y el Usuario esté listo,",
  "muestra un resumen claro en texto (vehículo, entrega, repuestos) y recuérdale",
  "que enviar la solicitud gasta 1 lupa (un solo lupeo aunque sean varios",
  "repuestos). SOLO en ese mensaje de resumen, añade al final una línea con el",
  "borrador en este formato exacto (el Usuario no lo verá):",
  '[LUPITA_DRAFT]{"vehicleId":<id o null>,"locationId":<id o null>,"deliveryPreference":"pickup"|"delivery"|null,"items":[{"productName":"...","quantity":1,"conditionPreferred":"no_importa","preferredBrand":null,"oemCode":null,"description":null}]}[/LUPITA_DRAFT]',
  "Usa los ids del contexto de la sesión; si algo no está resuelto (por ejemplo",
  "el Usuario no tiene vehículo guardado), pon null. No incluyas el bloque",
  "[LUPITA_DRAFT] en ningún otro mensaje.",
].join("\n");

function isValidMessage(message: unknown): message is ChatMessage {
  if (typeof message !== "object" || message === null) return false;
  const candidate = message as Record<string, unknown>;
  return (
    (candidate.role === "user" || candidate.role === "assistant") &&
    typeof candidate.content === "string"
  );
}

const STRAPI_API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

// Defensa en profundidad: aunque el home ya oculta el trigger de Lupita para
// clientes sin el feature flag, este endpoint también lo valida contra el
// backend antes de gastar tokens de LLM. La UI puede fallar/ser bypaseada;
// el backend (Strapi) es la fuente de verdad del flag.
async function assertLupitaEnabled(
  authHeader: string | null,
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  if (!authHeader) {
    return { ok: false, status: 401, error: "No autenticado" };
  }

  try {
    const res = await fetch(`${STRAPI_API_URL}/client-profiles/me`, {
      method: "GET",
      headers: { Authorization: authHeader },
    });

    if (!res.ok) {
      return { ok: false, status: 401, error: "No autenticado" };
    }

    const data = await res.json();
    if (data?.featureFlags?.lupita !== true) {
      return {
        ok: false,
        status: 403,
        error: "Lupita no está habilitada para este usuario",
      };
    }

    return { ok: true };
  } catch {
    return { ok: false, status: 401, error: "No autenticado" };
  }
}

export async function POST(request: NextRequest) {
  const featureCheck = await assertLupitaEnabled(
    request.headers.get("authorization"),
  );
  if (!featureCheck.ok) {
    return NextResponse.json(
      { error: featureCheck.error },
      { status: featureCheck.status },
    );
  }

  let body: { messages?: unknown; context?: unknown };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body inválido" },
      { status: 400 },
    );
  }

  const { messages, context } = body;

  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every(isValidMessage)
  ) {
    return NextResponse.json(
      { error: "messages es requerido y debe ser una lista válida" },
      { status: 400 },
    );
  }

  const lastMessage = messages[messages.length - 1];
  if (lastMessage.content.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `El mensaje no puede superar ${MAX_MESSAGE_LENGTH} caracteres` },
      { status: 400 },
    );
  }

  const sessionContext: SessionContext =
    typeof context === "object" && context !== null
      ? (context as SessionContext)
      : {};

  try {
    const systemPrompt = [
      loadKnowledge(),
      SUMMARY_PROTOCOL,
      buildContextBlock(sessionContext),
    ].join("\n\n---\n\n");

    const client = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
    });

    const chatMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];

    // Cadena de modelos free: si uno agota su cuota / falla / responde sin
    // choices, se intenta el siguiente.
    for (const model of MODELS) {
      try {
        const res = await client.chat.completions.create({
          model,
          messages: chatMessages,
        });

        // OpenRouter puede responder 200 con { error } y sin choices
        // (rate limit del free tier, key inválida, modelo caído).
        const reply = res?.choices?.[0]?.message?.content;

        if (reply) {
          return NextResponse.json({ reply });
        }

        const upstreamError = (res as unknown as { error?: unknown })?.error;
        console.error(
          `[lupita] '${model}' respondió sin choices, probando siguiente:`,
          upstreamError ?? res,
        );
      } catch (modelError) {
        console.error(
          `[lupita] '${model}' falló, probando siguiente:`,
          modelError,
        );
      }
    }

    console.error("[lupita] Todos los modelos free fallaron");
    return NextResponse.json({ reply: FALLBACK_REPLY });
  } catch (error) {
    console.error("[lupita] Error llamando al modelo:", error);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
