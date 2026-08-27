"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { ImageViewer } from "@/components/image-viewer/ImageViewer";
import { formatRelativeTime } from "@/app/lib/utils/formatRelativeTime";
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
}

function QuestionBadge({ status }: { status: QuestionStatus }) {
  if (status === "answered") return null;
  if (status === "pending") {
    return <span className={styles.badgePending}>Pendiente</span>;
  }
  return <span className={styles.badgeDismissed}>Sin respuesta</span>;
}

function QuestionItem({ q }: { q: ThreadQuestion }) {
  const [viewerSrc, setViewerSrc] = useState<string | null>(null);

  return (
    <div className={styles.question}>
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
}: QuestionsCardProps) {
  const [expanded, setExpanded] = useState(false);

  const total = threadData?.thread.total ?? 0;
  const answered = threadData?.thread.answered ?? 0;
  const isReadOnly = threadData?.thread.status === "read_only";
  const questions = threadData?.questions ?? [];
  const visible = expanded ? questions : questions.slice(0, COLLAPSED_COUNT);

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
              <QuestionItem key={q.id} q={q} />
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

      {/* CTA button */}
      {!loading && !error && !isReadOnly && (
        <button
          className={styles.ctaButton}
          onClick={() => toast("Disponible próximamente")}
        >
          Hacer una pregunta
        </button>
      )}
    </section>
  );
}
