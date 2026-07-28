"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { IconsApp } from "@/components/icons/Icons";
import { useAuth } from "@/context/AuthContext";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import LupitaAvatar from "./LupitaAvatar";
import styles from "./LupitaChat.module.css";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface DraftItem {
  productName: string;
  quantity: number;
  conditionPreferred?: string | null;
  preferredBrand?: string | null;
  oemCode?: string | null;
  description?: string | null;
}

interface RequestDraft {
  vehicleId: number | null;
  locationId: number | null;
  deliveryPreference: "pickup" | "delivery" | null;
  items: DraftItem[];
}

export interface LupitaSessionContext {
  firstName: string;
  // null = aún cargando (no confirmado); [] = vacío de verdad
  vehicles: Array<{ id: number; label: string }> | null;
  locations: Array<{ id: number; label: string }> | null;
  saldo?: {
    available: number;
    total: number;
    nextRenewal: string;
  };
}

interface LupitaChatProps {
  open: boolean;
  onClose: () => void;
  context: LupitaSessionContext;
}

const GREETING_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hola, soy Lupita. Cuéntame qué necesitas para tu carro y yo armo la solicitud por ti.",
  },
  {
    role: "assistant",
    content:
      "Puedes escribirlo con tus palabras: la marca, el año y qué se dañó. Yo me encargo del resto.",
  },
];

const ERROR_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Se me cruzaron los cables, inténtalo de nuevo.",
};

const DRAFT_REGEX = /\[LUPITA_DRAFT\]([\s\S]*?)\[\/LUPITA_DRAFT\]/;

function extractDraft(reply: string): {
  text: string;
  draft: RequestDraft | null;
} {
  const match = reply.match(DRAFT_REGEX);
  if (!match) return { text: reply, draft: null };

  const text = reply.replace(DRAFT_REGEX, "").trim();

  try {
    const draft = JSON.parse(match[1]) as RequestDraft;
    return { text, draft };
  } catch {
    return { text, draft: null };
  }
}

export default function LupitaChat({
  open,
  onClose,
  context,
}: LupitaChatProps) {
  const { jwt } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(GREETING_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [draft, setDraft] = useState<RequestDraft | null>(null);
  // 0 en Android/desktop (interactiveWidget ya encoge el viewport solo);
  // >0 en iOS Safari, que hace overlay del teclado sin redimensionar.
  const keyboardHeight = useKeyboardHeight();

  const threadEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    threadEndRef.current?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
    // keyboardHeight: re-scrollea al fondo cuando el teclado abre/cierra en
    // iOS, para que el último mensaje no quede tapado.
  }, [messages, isLoading, open, keyboardHeight]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];

    setMessages(nextMessages);
    setInput("");
    // El auto-grow del textarea setea altura inline por JS; sin este reset
    // quedaría "crecido" tras vaciar el texto.
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
    setIsLoading(true);

    try {
      const res = await fetch("/api/lupita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
        },
        body: JSON.stringify({ messages: nextMessages, context }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: { reply?: string } = await res.json();
      const reply = data.reply ?? ERROR_MESSAGE.content;

      const { text: cleanText, draft: parsedDraft } = extractDraft(reply);

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: cleanText || reply },
      ]);

      if (parsedDraft) setDraft(parsedDraft);
    } catch (error) {
      console.error("[lupita] Error enviando mensaje:", error);
      setMessages((prev) => [...prev, ERROR_MESSAGE]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend(input);
    }
  };

  // Auto-grow: mismo patrón que ChatInput.tsx del chat de mensajería.
  const handleInputChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setInput(event.target.value);
    const el = event.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  };

  const handleSubmitStub = () => {
    // TODO: resolver categoryId + vehicleId/locationId y POST
    // /quote-requests/me (JWT usuario, policy is-client, gasta 1 lupa).
    // NO se llama en esta v1.
    console.log("[lupita] Borrador de solicitud (STUB, no se envía):", {
      vehicleId: draft?.vehicleId ?? null,
      locationId: draft?.locationId ?? null,
      deliveryPreference: draft?.deliveryPreference ?? null,
      items: draft?.items ?? [],
      unresolved: {
        categoryId: "pendiente: se resuelve a partir del productName",
        vehicleId: draft?.vehicleId === null ? "sin resolver" : "ok",
        locationId: draft?.locationId === null ? "sin resolver" : "ok",
      },
    });
  };

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      // Empuja el sheet (clamped a max-height:100% en el CSS) por encima
      // del teclado en iOS. No-op en Android/desktop (keyboardHeight = 0).
      style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined}
    >
      <div
        className={styles.sheet}
        role="dialog"
        aria-label="Chat con Lupita"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <LupitaAvatar size={44} />
          <div className={styles.headerText}>
            <span className={styles.headerName}>Lupita</span>
            <span className={styles.headerSubtitle}>
              Te ayudo a pedir tu repuesto
            </span>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Cerrar chat"
            onClick={onClose}
          >
            <IconsApp.Close width="14" height="14" />
          </button>
        </header>

        <div className={styles.thread} role="log" aria-live="polite">
          {messages.map((message, index) =>
            message.role === "user" ? (
              // Burbuja del Usuario: texto plano a propósito (seguridad).
              <div key={index} className={styles.bubbleUser}>
                {message.content}
              </div>
            ) : (
              // Burbuja de Lupita: Markdown estándar (sin HTML crudo).
              <div
                key={index}
                className={`${styles.bubbleLupita} ${styles.markdown}`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkBreaks]}
                  components={{
                    a: ({ ...props }) => (
                      <a
                        {...props}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            ),
          )}

          {isLoading && (
            <div
              className={`${styles.bubbleLupita} ${styles.typing}`}
              aria-label="Lupita está escribiendo"
            >
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
          )}

          {draft && !isLoading && (
            <button
              type="button"
              className={styles.submitButton}
              onClick={handleSubmitStub}
            >
              Enviar solicitud
            </button>
          )}

          <div ref={threadEndRef} />
        </div>

        <footer className={styles.inputArea}>
          <textarea
            ref={inputRef}
            className={styles.input}
            aria-label="Escríbele a Lupita"
            placeholder="Cuéntame qué necesitas para tu carro"
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              // Espera a que el teclado termine de animarse (~300ms) y
              // luego hace scroll para que el textarea quede visible sobre
              // el teclado. Mismo patrón que ChatInput.tsx.
              setTimeout(() => {
                inputRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }, 300);
            }}
          />
          <button
            type="button"
            className={styles.sendButton}
            aria-label="Enviar mensaje"
            disabled={!input.trim() || isLoading}
            onClick={() => handleSend(input)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M2 8H14M14 8L8.5 2.5M14 8L8.5 13.5"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </footer>
      </div>
    </div>
  );
}
