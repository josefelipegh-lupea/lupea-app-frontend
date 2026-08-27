"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageViewer } from "@/components/image-viewer/ImageViewer";
import { formatRelativeTime } from "@/app/lib/utils/formatRelativeTime";
import {
  QuestionSheet,
  type QuestionSheetItem,
} from "@/components/question-sheet/QuestionSheet";
import type {
  RequestThreadData,
  ThreadQuestion,
  QuestionStatus,
} from "@/app/lib/api/provider/home/request";
import styles from "./QuestionsCard.module.css";

const COLLAPSED_COUNT = 3;

interface QuestionsCardProps {
  loading: boolean;
  error: boolean;
  threadData: RequestThreadData | null;
  onRetry: () => void;
  items: QuestionSheetItem[];
  requestDocId: string;
  jwt: string;
  onQuestionCreated: (question: ThreadQuestion) => void;
  onNeedsRefetch: () => void;
}

function QuestionBadge({ status }: { status: QuestionStatus }) {
  if (status === "answered") return null;
  if (status === "pending") {
    return <span className={styles.badgePending}>Pendiente</span>;
  }
  return <span className={styles.badgeDismissed}>Sin respuesta</span>;
}

function QuestionItem({
  q,
  registerRef,
  highlighted,
}: {
  q: ThreadQuestion;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
  highlighted: boolean;
}) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  return (
    <div
      ref={(el) => registerRef(q.id, el)}
      className={styles.question}
      style={
        highlighted
          ? { boxShadow: "0 0 0 2px #f08100", borderRadius: 8, transition: "box-shadow 0.3s" }
          : { transition: "box-shadow 0.3s" }
      }
    >
      <div className={styles.questionMeta}>
        <span className={styles.categoryLabel}>{q.categoryLabel}</span>
        {q.item && (
          <span className={styles.itemChip}>{q.item.name}</span>
        )}
      </div>

      <p className={styles.questionContent}>{q.content}</p>

      <div className={styles.questionFooter}>
        <span className={styles.authorLine}>
          {q.isMine ? "Tu pregunta" : "Un proveedor"}
          {" · "}
          {formatRelativeTime(q.createdAt)}
        </span>
        <QuestionBadge status={q.status} />
      </div>

      {q.status === "dismissed" && (
        <p className={styles.statusNote}>El cliente no respondió esta pregunta.</p>
      )}
      {q.status === "expired" && (
        <p className={styles.statusNote}>
          La solicitud se cerró antes de que el cliente respondiera.
        </p>
      )}

      {q.answer && (
        <div className={styles.answerBlock}>
          <span className={styles.answerLabel}>RESPUESTA DEL CLIENTE</span>
          <p className={styles.answerContent}>{q.answer.content}</p>
          {q.answer.media && (
            <button
              className={styles.thumbButton}
              onClick={() => setViewerSrc(q.answer!.media!.url)}
              aria-label="Ver imagen en tamaño completo"
            >
              <img
                className={styles.thumb}
                src={q.answer.media.thumb}
                alt="Imagen adjunta"
              />
            </button>
          )}
        </div>
      )}

      {viewerSrc && (
        <ImageViewer
          src={viewerSrc}
          alt="Respuesta del cliente"
          onClose={() => setViewerSrc(null)}
        />
      )}
    </div>
  );
}

export function QuestionsCard({
  loading,
  error,
  threadData,
  onRetry,
  items,
  requestDocId,
  jwt,
  onQuestionCreated,
  onNeedsRefetch,
}: QuestionsCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pendingScrollQid, setPendingScrollQid] = useState<string | null>(null);
  const [highlightedQid, setHighlightedQid] = useState<string | null>(null);

  const refsMap = useRef<Map<string, HTMLDivElement>>(new Map());
  const registerRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el) refsMap.current.set(id, el);
    else refsMap.current.delete(id);
  }, []);

  const total = threadData?.thread.total ?? 0;
  const answered = threadData?.thread.answered ?? 0;
  const pending = threadData?.thread.pending ?? 0;
  const isReadOnly = threadData?.thread.status === "read_only";
  const questions = useMemo(
    () => threadData?.questions ?? [],
    [threadData?.questions],
  );
  const permissions = threadData?.permissions;
  const visible = expanded ? questions : questions.slice(0, COLLAPSED_COUNT);

  // "Ver respuesta": expandir la card y luego hacer scroll al nodo cuando exista.
  useEffect(() => {
    if (!pendingScrollQid) return;
    const raf = requestAnimationFrame(() => {
      const el = refsMap.current.get(pendingScrollQid);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        setHighlightedQid(pendingScrollQid);
      }
      // Si no está en el DOM tras expandir: cerrar en silencio (ya está cerrado el sheet).
      setPendingScrollQid(null);
    });
    return () => cancelAnimationFrame(raf);
  }, [pendingScrollQid, expanded, questions]);

  // Limpiar el resalte tras un momento.
  useEffect(() => {
    if (!highlightedQid) return;
    const t = setTimeout(() => setHighlightedQid(null), 1800);
    return () => clearTimeout(t);
  }, [highlightedQid]);

  const handleViewAnswer = (qid: string) => {
    setSheetOpen(false);
    setExpanded(true);
    setPendingScrollQid(qid);
  };

  // Texto cuando el proveedor no puede preguntar (prioridad: read_only → 0 → pending).
  const noAskText = (() => {
    if (isReadOnly) return "Esta solicitud ya no admite preguntas.";
    if (permissions && permissions.remaining === 0)
      return "Alcanzaste el máximo de 3 preguntas para esta solicitud.";
    if (pending >= 10)
      return "Este cliente tiene varias preguntas pendientes. Puedes cotizar indicando tus supuestos.";
    return "Esta solicitud ya no admite preguntas.";
  })();

  return (
    <section className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconBox}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f08100"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="#f08100" />
            </svg>
          </div>
          <h3 className={styles.title}>Preguntas</h3>
        </div>
        <span className={styles.counter}>
          {total > 0 ? `${total} · ${answered} respondidas` : "0"}
        </span>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className={styles.skeletonWrap}>
          {[1, 2].map((i) => (
            <div key={i} className={styles.skeletonQuestion}>
              <div className={styles.skeletonLine} style={{ width: "30%", height: 12 }} />
              <div className={styles.skeletonLine} style={{ width: "90%", height: 16, marginTop: 6 }} />
              <div className={styles.skeletonLine} style={{ width: "50%", height: 12, marginTop: 6 }} />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.errorState}>
          <p className={styles.errorText}>No se pudieron cargar las preguntas.</p>
          <button className={styles.retryButton} onClick={onRetry}>
            Reintentar
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && total === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f08100"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <circle cx="12" cy="17" r="0.5" fill="#f08100" />
            </svg>
          </div>
          <p className={styles.emptyTitle}>Aún no hay preguntas sobre esta solicitud</p>
          <p className={styles.emptySubtitle}>Si algo no está claro, pregunta antes de cotizar.</p>
        </div>
      )}

      {/* Questions list */}
      {!loading && !error && total > 0 && (
        <>
          <div className={styles.questionList}>
            {visible.map((q) => (
              <QuestionItem
                key={q.id}
                q={q}
                registerRef={registerRef}
                highlighted={highlightedQid === q.id}
              />
            ))}
          </div>

          {total > COLLAPSED_COUNT && (
            <button
              className={styles.expandLink}
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? "Ver menos" : `Ver las ${total} preguntas`}
            </button>
          )}
        </>
      )}

      {/* CTA / motivo bloqueado */}
      {!loading && !error && permissions && (
        permissions.canAsk ? (
          <button
            className={styles.ctaButton}
            onClick={() => setSheetOpen(true)}
          >
            Hacer una pregunta
          </button>
        ) : (
          <p className={styles.emptySubtitle} style={{ textAlign: "center", marginTop: 12 }}>
            {noAskText}
          </p>
        )
      )}

      {permissions && (
        <QuestionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          items={items}
          permissions={permissions}
          requestDocId={requestDocId}
          jwt={jwt}
          onCreated={onQuestionCreated}
          onViewAnswer={handleViewAnswer}
          onNeedsRefetch={onNeedsRefetch}
        />
      )}
    </section>
  );
}
