"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import {
  createThreadQuestion,
  type CreateQuestionBody,
  type QuestionCategory,
  type ThreadPermissions,
  type ThreadQuestion,
} from "@/app/lib/api/provider/home/request";

// Chips de categoría — constantes de UI (no vienen del backend).
const CATEGORY_CHIPS: { label: string; value: QuestionCategory }[] = [
  { label: "Foto de la pieza", value: "part_photo" },
  { label: "Código OEM", value: "oem_code" },
  { label: "Versión / motor", value: "engine_version" },
  { label: "Lado izq/der", value: "side" },
  { label: "¿Acepta genérico?", value: "accepts_aftermarket" },
  { label: "Cantidad", value: "quantity" },
  { label: "Otra pregunta", value: "other" },
];

const ERROR_MESSAGES: Record<string, string> = {
  THREAD_CLOSED: "Esta solicitud ya no admite preguntas.",
  DUPLICATE_QUESTION: "Ya hay una pregunta sobre esto.",
  PROVIDER_LIMIT_REACHED:
    "Alcanzaste el máximo de 3 preguntas para esta solicitud.",
  THREAD_PENDING_LIMIT:
    "Este cliente tiene varias preguntas pendientes. Puedes cotizar indicando tus supuestos.",
  INVALID_ITEM: "El repuesto indicado no corresponde a esta solicitud.",
  INVALID_CONTENT: "Escribe tu pregunta (máximo 300 caracteres).",
};
const GENERIC_ERROR = "No se pudo enviar la pregunta. Intenta de nuevo.";

const MAX_CONTENT = 300;

export interface QuestionSheetItem {
  documentId: string;
  productName: string;
}

interface QuestionSheetProps {
  open: boolean;
  onClose: () => void;
  items: QuestionSheetItem[];
  permissions: ThreadPermissions;
  requestDocId: string;
  jwt: string;
  onCreated: (question: ThreadQuestion) => void;
  onViewAnswer: (questionId: string) => void;
  onNeedsRefetch: () => void;
}

export function QuestionSheet({
  open,
  onClose,
  items,
  permissions,
  requestDocId,
  jwt,
  onCreated,
  onViewAnswer,
  onNeedsRefetch,
}: QuestionSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [shown, setShown] = useState(false);

  // null = "Toda la solicitud"
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [category, setCategory] = useState<QuestionCategory | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // questionId del chip bloqueado que el usuario tocó explícitamente
  const [tappedBlockedQid, setTappedBlockedQid] = useState<string | null>(null);

  const resetState = () => {
    setSelectedItemId(null);
    setCategory(null);
    setContent("");
    setSubmitting(false);
    setErrorMsg(null);
    setTappedBlockedQid(null);
  };

  // Abrir/cerrar el <dialog> nativo con animación de entrada.
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

  // Cierra con animación: baja el panel y espera al transitionend.
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

  // Escape dispara 'cancel' en <dialog>: interceptar para animar la salida.
  const handleCancel = (e: React.SyntheticEvent<HTMLDialogElement>) => {
    e.preventDefault();
    requestClose();
  };

  // Recalcular bloqueos cuando cambia el repuesto seleccionado.
  const blockedByCategory = useMemo(() => {
    const map = new Map<QuestionCategory, string>();
    for (const b of permissions.blockedCategories) {
      if (b.itemId === selectedItemId) map.set(b.category, b.questionId);
    }
    return map;
  }, [permissions.blockedCategories, selectedItemId]);

  // Si la categoría seleccionada quedó bloqueada al cambiar de repuesto.
  const selectedBlockedQid = category ? blockedByCategory.get(category) : undefined;
  const hintQid = selectedBlockedQid ?? tappedBlockedQid;

  const contentEmpty = content.trim().length === 0;
  const canSubmit =
    !!category &&
    !submitting &&
    !selectedBlockedQid &&
    !(category === "other" && contentEmpty);

  const handleSelectItem = (id: string | null) => {
    setSelectedItemId(id);
    setTappedBlockedQid(null);
    setErrorMsg(null);
  };

  const handleSelectCategory = (cat: QuestionCategory, blockedQid?: string) => {
    if (blockedQid) {
      setTappedBlockedQid(blockedQid);
      return;
    }
    setCategory(cat);
    setTappedBlockedQid(null);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !category) return;
    setSubmitting(true);
    setErrorMsg(null);

    const body: CreateQuestionBody = { category };
    if (selectedItemId) body.requestItemId = selectedItemId;
    if (category === "other") body.content = content.trim();

    const res = await createThreadQuestion(jwt, requestDocId, body);

    if (res.ok) {
      onCreated(res.question);
      toast.success("Pregunta enviada");
      requestClose();
      return;
    }

    setErrorMsg(ERROR_MESSAGES[res.code] ?? GENERIC_ERROR);
    if (res.code === "DUPLICATE_QUESTION" || res.code === "PROVIDER_LIMIT_REACHED") {
      onNeedsRefetch();
    }
    setSubmitting(false);
  };

  const remaining = permissions.remaining;
  const remainingText =
    remaining > 1
      ? `Te quedan ${remaining} preguntas en esta solicitud.`
      : remaining === 1
        ? "Te queda 1 pregunta en esta solicitud."
        : "";

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={(e) => {
        if (e.target === dialogRef.current) requestClose();
      }}
      className="m-0 w-full max-w-full bg-transparent p-0 backdrop:bg-black/40 sm:mx-auto sm:max-w-md"
      style={{ marginTop: "auto", marginBottom: 0 }}
      aria-label="Hacer una pregunta"
    >
      <div
        onTransitionEnd={handlePanelTransitionEnd}
        className="flex max-h-[88vh] w-full flex-col overflow-y-auto rounded-t-2xl bg-white px-5 pb-6 pt-3 transition-transform duration-[250ms] ease-out"
        style={{ transform: shown ? "translateY(0)" : "translateY(100%)" }}
      >
        {/* Handle bar */}
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />

        <h2 className="text-lg font-semibold text-gray-900">Hacer una pregunta</h2>
        <p className="mt-1 text-sm text-gray-500">
          Tu pregunta es anónima. La respuesta del cliente será visible para todos
          los proveedores.
        </p>

        {/* Bloque 1 — repuesto */}
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-800">
            ¿Sobre qué repuesto?{" "}
            <span className="font-normal text-gray-400">(opcional)</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Chip
              selected={selectedItemId === null}
              onClick={() => handleSelectItem(null)}
            >
              Toda la solicitud
            </Chip>
            {items.map((item) => (
              <Chip
                key={item.documentId}
                selected={selectedItemId === item.documentId}
                onClick={() => handleSelectItem(item.documentId)}
              >
                {item.productName}
              </Chip>
            ))}
          </div>
        </div>

        {/* Bloque 2 — categoría */}
        <div className="mt-5">
          <p className="text-sm font-medium text-gray-800">¿Qué necesitas saber?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORY_CHIPS.map((chip) => {
              const blockedQid = blockedByCategory.get(chip.value);
              return (
                <Chip
                  key={chip.value}
                  selected={category === chip.value}
                  blocked={!!blockedQid}
                  onClick={() => handleSelectCategory(chip.value, blockedQid)}
                >
                  {chip.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Aviso de duplicado */}
        {hintQid && (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2">
            <span className="flex items-center gap-2 text-sm text-amber-700">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Ya hay una pregunta sobre esto
            </span>
            <button
              type="button"
              onClick={() => onViewAnswer(hintQid)}
              className="shrink-0 text-sm font-medium text-amber-700 underline"
            >
              Ver respuesta
            </button>
          </div>
        )}

        {/* Bloque 3 — texto libre (solo "other") */}
        {category === "other" && (
          <div className="mt-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, MAX_CONTENT))}
              maxLength={MAX_CONTENT}
              rows={3}
              placeholder="Escribe tu pregunta (máx. 300 caracteres)"
              className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-[#f08100]"
            />
            <p className="mt-1 text-right text-xs text-gray-400">
              {content.length} / {MAX_CONTENT}
            </p>
          </div>
        )}

        {/* Error de envío */}
        {errorMsg && (
          <p className="mt-3 text-sm text-red-600">{errorMsg}</p>
        )}

        {/* Pie */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className="mt-5 w-full rounded-lg bg-[#f08100] py-3 text-center text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? "Enviando…" : "Enviar pregunta"}
        </button>

        {remainingText && (
          <p className="mt-2 text-center text-xs text-gray-400">{remainingText}</p>
        )}
      </div>
    </dialog>
  );
}

function Chip({
  children,
  selected,
  blocked,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  blocked?: boolean;
  onClick: () => void;
}) {
  if (blocked) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-100 px-3 py-1.5 text-sm text-gray-400"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        {children}
      </button>
    );
  }
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
