import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Modelo único de la v1. Free tier de OpenRouter.
// Para migrar a Claude: model = "anthropic/claude-haiku-4.5"
const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";

const MAX_MESSAGE_LENGTH = 1000;

const FALLBACK_REPLY =
  "Se me cruzaron los cables un segundo. Inténtalo de nuevo, aquí sigo.";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface SessionContext {
  firstName?: string;
  vehicles?: Array<{ id: number; label: string }>;
  locations?: Array<{ id: number; label: string }>;
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

function buildContextBlock(context: SessionContext): string {
  const vehicles =
    context.vehicles && context.vehicles.length > 0
      ? context.vehicles
          .map((vehicle) => `- id ${vehicle.id}: ${vehicle.label}`)
          .join("\n")
      : "ninguno";

  const locations =
    context.locations && context.locations.length > 0
      ? context.locations
          .map((location) => `- id ${location.id}: ${location.label}`)
          .join("\n")
      : "ninguna";

  return [
    "CONTEXTO DE ESTA SESIÓN",
    `Usuario: ${context.firstName || "sin nombre"}`,
    `Vehículos guardados:\n${vehicles}`,
    `Direcciones guardadas:\n${locations}`,
    "Usa estos ids para anclar las referencias. Si una lista está vacía, el",
    "Usuario aún no tiene guardados y debes pedir los datos.",
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

export async function POST(request: NextRequest) {
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

    const res = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    // OpenRouter puede responder 200 con { error } y sin choices
    // (rate limit del free tier, key inválida, modelo caído).
    const reply = res?.choices?.[0]?.message?.content;

    if (!reply) {
      const upstreamError = (res as unknown as { error?: unknown })?.error;
      console.error(
        "[lupita] Respuesta sin choices del modelo:",
        upstreamError ?? res,
      );
      return NextResponse.json({ reply: FALLBACK_REPLY });
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("[lupita] Error llamando al modelo:", error);
    return NextResponse.json({ reply: FALLBACK_REPLY });
  }
}
