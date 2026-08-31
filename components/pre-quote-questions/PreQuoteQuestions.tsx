"use client";

import React, { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import {
  getRequestThread,
  dismissThreadQuestion,
  RequestThreadData,
  ThreadQuestion,
} from "@/app/lib/api/thread";
import { formatRelativeTime } from "@/app/lib/utils/formatRelativeTime";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";
import { ImageViewer } from "@/components/image-viewer/ImageViewer";
import styles from "./PreQuoteQuestions.module.css";

interface PreQuoteQuestionsProps {
  requestDocumentId: string;
}

const DISMISS_ERROR_MAP: Record<string, string> = {
  THREAD_CLOSED: "Esta solicitud ya no admite cambios.",
  QUESTION_NOT_PENDING: "Esta pregunta ya fue atendida.",
  QUESTION_NOT_FOUND: "No se encontró la pregunta.",
};

function dismissErrorMessage(code: string): string {
  return DISMISS_ERROR_MAP[code] ?? "No se pudo completar la acción. Intenta de nuevo.";
}

function QuestionIcon() {
  return (
    <span className={styles.headerIconBox}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    </span>
  );
}

export function PreQuoteQuestions({ requestDocumentId }: PreQuoteQuestionsProps) {
  const { jwt } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<RequestThreadData | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetQuestion, setTargetQuestion] = useState<ThreadQuestion | null>(null);
  const [dismissing, setDismissing] = useState(false);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  const fetchThread = useCallback(async () => {
    if (!jwt || !requestDocumentId) return;
    try {
      const res = await getRequestThread(jwt, requestDocumentId);
      if (res.ok) {
        setData(res.data);
        setError(false);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
  }, [jwt, requestDocumentId]);

  useEffect(() => {
    setLoading(true);
    fetchThread().finally(() => setLoading(false));
  }, [fetchThread]);

  const openConfirm = (question: ThreadQuestion) => {
    setTargetQuestion(question);
    setConfirmOpen(true);
  };

  const handleDismissConfirm = async () => {
    if (!jwt || !targetQuestion || dismissing) return;
    setDismissing(true);
    const result = await dismissThreadQuestion(jwt, requestDocumentId, targetQuestion.id);
    setDismissing(false);

    if (result.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const questions = prev.questions.map((q) =>
          q.id === result.question.id ? result.question : q,
        );
        const pendingCount = questions.filter((q) => q.status === "pending").length;
        return {
          ...prev,
          thread: { ...prev.thread, pending: pendingCount },
          questions,
        };
      });
      toast.success("Pregunta descartada");
      fetchThread();
    } else {
      toast.error(dismissErrorMessage(result.code));
      if (result.code === "QUESTION_NOT_PENDING") {
        fetchThread();
      }
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className={styles.card}>
        <div className={styles.skeletonHeader} />
        <div className={styles.skeletonRow} />
        <div className={styles.skeletonRow} />
      </div>
    );
  }

  // ── Fetch error ───────────────────────────────────────────────────────────

  if (error || !data) {
    return (
      <div className={styles.card}>
        <p className={styles.errorText}>No se pudieron cargar las preguntas</p>
        <button
          className={styles.retryBtn}
          onClick={() => {
            setError(false);
            setLoading(true);
            fetchThread().finally(() => setLoading(false));
          }}
        >
          Reintentar
        </button>
      </div>
    );
  }

  const { thread, questions, permissions } = data;
  const canAnswer = permissions.canAnswer ?? false;

  // ── Empty state ───────────────────────────────────────────────────────────

  if (thread.total === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <QuestionIcon />
          <h2 className={styles.headerTitle}>Preguntas de proveedores</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyCircle}>
            <QuestionIcon />
          </div>
          <p className={styles.emptyTitle}>Ningún proveedor ha preguntado todavía</p>
          <p className={styles.emptySubtext}>
            Las preguntas de los proveedores aparecerán aquí antes de que coticen.
          </p>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.card}>
        {/* Header */}
        <div className={styles.header}>
          <QuestionIcon />
          <h2 className={styles.headerTitle}>Preguntas de proveedores</h2>
          {thread.pending > 0 ? (
            <span className={styles.badgeAmber}>{thread.pending} sin responder</span>
          ) : (
            <span className={styles.badgeNeutral}>
              {thread.total} · {thread.answered} respondidas
            </span>
          )}
        </div>

        {/* Context text */}
        <p className={styles.contextText}>
          Tu respuesta se comparte con todos los proveedores. Responder rápido mejora las cotizaciones que recibes.
        </p>

        {/* Questions list */}
        <ul className={styles.list}>
          {questions.map((q) => (
            <li
              key={q.id}
              className={`${styles.questionItem} ${q.status === "pending" ? styles.pendingItem : ""}`}
            >
              {/* Meta row: category + status pill (non-pending) */}
              <div className={styles.metaRow}>
                <span className={styles.categoryLabel}>{q.categoryLabel.toUpperCase()}</span>
                <span className={styles.metaRowSpacer} />
                {q.status === "answered" && (
                  <span className={styles.badgeAnswered}>Respondida</span>
                )}
                {q.status === "dismissed" && (
                  <span className={styles.badgeDismissed}>Descartada</span>
                )}
                {q.status === "expired" && (
                  <span className={styles.badgeExpired}>Sin respuesta</span>
                )}
              </div>
              {/* Item chip on its own line */}
              {q.item && (
                <div className={styles.itemChipRow}>
                  <span className={styles.itemChip}>{q.item.name}</span>
                </div>
              )}

              {/* Question content */}
              <p className={styles.questionContent}>{q.content}</p>

              {/* Answered: answer box + optional media */}
              {q.status === "answered" && (
                <div className={styles.answeredBlock}>
                  {q.answer?.content && (
                    <p className={styles.answerContent}>{q.answer.content}</p>
                  )}
                  {q.answer?.media && (
                    <button
                      className={styles.thumbBtn}
                      onClick={() => setLightboxSrc(q.answer!.media!.url)}
                    >
                      <img
                        src={q.answer.media.thumb}
                        alt="Ver imagen de respuesta"
                        className={styles.thumb}
                      />
                    </button>
                  )}
                </div>
              )}

              {/* Dismissed / expired: subtext */}
              {q.status === "dismissed" && (
                <p className={styles.dismissedText}>No respondiste esta pregunta.</p>
              )}
              {q.status === "expired" && (
                <p className={styles.expiredText}>
                  La solicitud se cerró antes de que respondieras.
                </p>
              )}

              {/* Attribution */}
              <p className={styles.attribution}>
                Un proveedor · {formatRelativeTime(q.createdAt)}
              </p>

              {/* Pending actions */}
              {q.status === "pending" && canAnswer && (
                <div className={styles.actions}>
                  <button
                    className={styles.answerBtn}
                    onClick={() => toast("Disponible próximamente")}
                  >
                    Responder
                  </button>
                  <button
                    className={styles.dismissLink}
                    onClick={() => openConfirm(q)}
                  >
                    Descartar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Confirm dismiss modal */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setTargetQuestion(null);
        }}
        onConfirm={handleDismissConfirm}
        title="¿Descartar esta pregunta?"
        description="El proveedor verá que no la respondiste. No podrás deshacer esta acción."
        confirmText="Descartar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Image lightbox */}
      {lightboxSrc && (
        <ImageViewer
          src={lightboxSrc}
          alt="Imagen de respuesta"
          onClose={() => setLightboxSrc(null)}
        />
      )}
    </>
  );
}
