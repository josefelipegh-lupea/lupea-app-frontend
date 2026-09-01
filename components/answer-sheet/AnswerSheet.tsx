"use client";

import { useEffect, useRef, useState } from "react";
import {
  answerThreadQuestion,
  answerErrorMessage,
  uploadThreadAttachment,
  type ThreadQuestion,
  type QuestionCategory,
} from "@/app/lib/api/thread";
import { formatRelativeTime } from "@/app/lib/utils/formatRelativeTime";

// ── Constantes de variante ────────────────────────────────────────────────────

type Variant = "A" | "B" | "C";

const VARIANT_MAP: Record<QuestionCategory, Variant> = {
  side: "A",
  accepts_aftermarket: "A",
  part_photo: "B",
  oem_code: "C",
  engine_version: "C",
  quantity: "C",
  other: "C",
};

const CHIPS_SIDE = ["Izquierdo", "Derecho", "Ambos", "No sé"];
const CHIPS_AFTERMARKET = [
  "Solo original",
  "Acepto genérico",
  "Prefiero original, pero acepto",
  "No sé",
];
const DETAIL_PLACEHOLDER: Record<string, string> = {
  side: "Ej: los dos están rotos",
  accepts_aftermarket: "Agrega un detalle si quieres",
};

const MAX_CONTENT = 500;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp"];

// ── Props ─────────────────────────────────────────────────────────────────────

interface AnswerSheetProps {
  open: boolean;
  question: ThreadQuestion | null;
  requestDocumentId: string;
  jwt: string;
  onClose: () => void;
  onAnswered: (updated: ThreadQuestion) => void;
}

// ── Componente principal ──────────────────────────────────────────────────────

export function AnswerSheet({
  open,
  question,
  requestDocumentId,
  jwt,
  onClose,
  onAnswered,
}: AnswerSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [shown, setShown] = useState(false);

  // ── Estado de variante A ──
  const [selectedChip, setSelectedChip] = useState<string | null>(null);
  const [detailA, setDetailA] = useState("");

  // ── Estado de variante B ──
  const [mediaId, setMediaId] = useState<number | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detailB, setDetailB] = useState("");

  // ── Estado de variante C ──
  const [textC, setTextC] = useState("");

  // ── Estado común ──
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetState = () => {
    setSelectedChip(null);
    setDetailA("");
    setMediaId(null);
    setThumb(null);
    setUploading(false);
    setUploadError(null);
    setDetailB("");
    setTextC("");
    setSubmitting(false);
    setErrorMsg(null);
  };

  // ── Apertura/cierre animado ───────────────────────────────────────────────

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (open) {
      if (!dlg.open) dlg.showModal();
      const id = requestAnimationFrame(() => setShown(true));
      return () => cancelAnimationFrame(id);
    }
  }, [open]);

  const finalizeClose = () => {
    const dlg = dialogRef.current;
    if (dlg?.open) dlg.close();
    resetState();
    onClose();
  };

  const requestClose = () => {
    if (!shown) {
      finalizeClose();
      return;
    }
    setShown(false);
  };

  const handlePanelTransitionEnd = () => {
    if (!shown && open) finalizeClose();
  };

  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    requestClose();
  };

  // ── Derivados ─────────────────────────────────────────────────────────────

  if (!question) return null;

  const variant = VARIANT_MAP[question.category] ?? "C";
  const chips = question.category === "side" ? CHIPS_SIDE : CHIPS_AFTERMARKET;

  const canSubmit = (() => {
    if (submitting) return false;
    if (variant === "A") return !!selectedChip;
    if (variant === "B") return !!mediaId || detailB.trim().length > 0;
    if (variant === "C") return textC.trim().length > 0;
    return false;
  })();

  // ── Subida de imagen (variante B) ─────────────────────────────────────────

  const handleFileSelected = async (file: File | undefined) => {
    if (!file) return;
    if (!ALLOWED_MIMES.includes(file.type)) {
      setUploadError("Formato no soportado. Usa JPG, PNG o WEBP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("La imagen supera los 5 MB.");
      return;
    }
    setUploading(true);
    setUploadError(null);
    setMediaId(null);
    setThumb(null);

    const result = await uploadThreadAttachment(jwt, requestDocumentId, file);

    if (result.ok) {
      setMediaId(result.image.id);
      setThumb(result.image.thumb ?? result.image.url);
    } else {
      setUploadError("No se pudo subir la imagen. Intenta con otra.");
    }
    setUploading(false);
  };

  const handleRemoveImage = () => {
    setMediaId(null);
    setThumb(null);
    setUploadError(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Envío ─────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorMsg(null);

    let content: string | null = null;
    let finalMediaId: number | null = null;

    if (variant === "A") {
      const label = selectedChip!;
      const detail = detailA.trim();
      content = detail ? `${label}. ${detail}` : label;
    } else if (variant === "B") {
      finalMediaId = mediaId;
      const detail = detailB.trim();
      if (detail) content = detail;
    } else {
      content = textC.trim();
    }

    const result = await answerThreadQuestion(jwt, requestDocumentId, question.id, {
      content,
      mediaId: finalMediaId,
    });

    if (result.ok) {
      onAnswered(result.question);
      return;
      // parent handles: toast, close, counters, refetch
    }

    setErrorMsg(answerErrorMessage(result.code));
    setSubmitting(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) requestClose();
      }}
      className="m-0 w-full max-w-full bg-transparent p-0 backdrop:bg-black/40 sm:mx-auto sm:max-w-md"
      style={{ marginTop: "auto", marginBottom: 0 }}
      aria-label="Responder pregunta"
    >
      <div
        onTransitionEnd={handlePanelTransitionEnd}
        className="flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-3 transition-transform duration-[250ms] ease-out"
        style={{ transform: shown ? "translateY(0)" : "translateY(100%)" }}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />

        {/* Título */}
        <h2 className="text-lg font-semibold text-gray-900">Responder</h2>

        {/* Card de la pregunta */}
        <QuestionCard question={question} />

        {/* Variante */}
        <div className="mt-4">
          {variant === "A" && (
            <VariantA
              chips={chips}
              selectedChip={selectedChip}
              onSelectChip={setSelectedChip}
              detail={detailA}
              onDetailChange={setDetailA}
              placeholder={DETAIL_PLACEHOLDER[question.category] ?? "Agrega un detalle si quieres"}
            />
          )}
          {variant === "B" && (
            <VariantB
              uploading={uploading}
              thumb={thumb}
              uploadError={uploadError}
              detail={detailB}
              onDetailChange={setDetailB}
              onRemoveImage={handleRemoveImage}
              cameraInputRef={cameraInputRef}
              fileInputRef={fileInputRef}
              onFileSelected={handleFileSelected}
            />
          )}
          {variant === "C" && (
            <VariantC
              text={textC}
              onTextChange={setTextC}
              textareaRef={textareaRef}
            />
          )}
        </div>

        {/* Error de envío (dentro del sheet) */}
        {errorMsg && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {errorMsg}
          </p>
        )}

        {/* Pie */}
        <div className="mt-5 flex items-start gap-2">
          {/* Ícono ojo */}
          <svg
            className="mt-0.5 shrink-0 text-gray-400"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <p className="text-xs text-gray-400">
            Esta respuesta será visible para todos los proveedores que reciban tu solicitud.
          </p>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-3 w-full rounded-lg bg-[#f08100] py-3 text-center text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Publicando…" : "Publicar respuesta"}
        </button>
      </div>
    </dialog>
  );
}

// ── Card de la pregunta ───────────────────────────────────────────────────────

function QuestionCard({ question }: { question: ThreadQuestion }) {
  return (
    <div className="mt-3 rounded-xl bg-gray-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">
        {question.categoryLabel}
      </p>
      {question.item && (
        <span className="mt-1 inline-block rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
          {question.item.name}
        </span>
      )}
      <p className="mt-1 text-sm font-medium text-gray-800">{question.content}</p>
      <p className="mt-1 text-xs text-gray-400">
        Un proveedor · {formatRelativeTime(question.createdAt)}
      </p>
    </div>
  );
}

// ── Chip de selección ─────────────────────────────────────────────────────────

function Chip({
  children,
  selected,
  onClick,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-full border px-3 py-1.5 text-sm transition-colors " +
        (selected
          ? "border-[#f08100] bg-[#fff4e6] font-medium text-[#f08100]"
          : "border-gray-200 bg-white text-gray-700")
      }
    >
      {children}
    </button>
  );
}

// ── Variante A — respuestas rápidas ──────────────────────────────────────────

function VariantA({
  chips,
  selectedChip,
  onSelectChip,
  detail,
  onDetailChange,
  placeholder,
}: {
  chips: string[];
  selectedChip: string | null;
  onSelectChip: (v: string) => void;
  detail: string;
  onDetailChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {chips.map((label) => (
          <Chip key={label} selected={selectedChip === label} onClick={() => onSelectChip(label)}>
            {label}
          </Chip>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-700">
          Agregar detalle{" "}
          <span className="text-gray-400">(opcional)</span>
        </p>
        <input
          type="text"
          value={detail}
          onChange={(e) => onDetailChange(e.target.value)}
          placeholder={placeholder}
          className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#f08100]"
        />
      </div>
    </div>
  );
}

// ── Variante B — foto ─────────────────────────────────────────────────────────

function VariantB({
  uploading,
  thumb,
  uploadError,
  detail,
  onDetailChange,
  onRemoveImage,
  cameraInputRef,
  fileInputRef,
  onFileSelected,
}: {
  uploading: boolean;
  thumb: string | null;
  uploadError: string | null;
  detail: string;
  onDetailChange: (v: string) => void;
  onRemoveImage: () => void;
  cameraInputRef: React.RefObject<HTMLInputElement | null>;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileSelected: (file: File | undefined) => void;
}) {
  const hasImage = !!thumb || uploading;

  return (
    <div>
      {!hasImage ? (
        /* Zona de captura */
        <div className="flex min-h-[120px] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 px-4 py-6">
          {/* Ícono cámara */}
          <svg
            className="text-amber-400"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>

          <div className="flex gap-2">
            {/* Botón cámara: capture="environment" */}
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Tomar foto
            </button>
            {/* Botón galería/archivo */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
            >
              Subir imagen
            </button>
          </div>

          {/* Inputs ocultos */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            capture="environment"
            className="hidden"
            onChange={(e) => onFileSelected(e.target.files?.[0])}
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => onFileSelected(e.target.files?.[0])}
          />
        </div>
      ) : (
        /* Vista previa de imagen */
        <div className="flex items-start gap-3">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {uploading ? (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-xs text-gray-400">…</span>
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb!} alt="Vista previa" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={onRemoveImage}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                  aria-label="Quitar imagen"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </>
            )}
          </div>

          <input
            type="text"
            value={detail}
            onChange={(e) => onDetailChange(e.target.value)}
            placeholder="Agregar detalle (opcional)"
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#f08100]"
          />
        </div>
      )}

      {/* Error de upload (no bloquea el resto) */}
      {uploadError && (
        <p className="mt-2 text-sm text-red-500">{uploadError}</p>
      )}
    </div>
  );
}

// ── Variante C — texto libre ──────────────────────────────────────────────────

function VariantC({
  text,
  onTextChange,
  textareaRef,
}: {
  text: string;
  onTextChange: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
  const handleNoSe = () => {
    onTextChange("No lo tengo");
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  return (
    <div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value.slice(0, MAX_CONTENT))}
        maxLength={MAX_CONTENT}
        rows={4}
        placeholder="Escribe tu respuesta"
        className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#f08100]"
      />
      <p className="mt-1 text-right text-xs text-gray-400">
        {text.length} / {MAX_CONTENT}
      </p>

      <button
        type="button"
        onClick={handleNoSe}
        className="mt-2 w-full rounded-lg border border-gray-200 py-2.5 text-sm text-gray-600"
      >
        No lo tengo / No sé
      </button>
    </div>
  );
}
