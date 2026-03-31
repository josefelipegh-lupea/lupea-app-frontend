"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { createProviderReview } from "@/app/lib/api/provider/review";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "./Review.module.css";
import Header from "@/components/header/Header";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ReviewPage({ params }: PageProps) {
  const { id: orderId } = useParams() as { id: string };
  const router = useRouter();
  const { jwt, role } = useAuth();
  const { isExpanded } = useSidebar();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !jwt) return;

    setSubmitting(true);
    try {
      const res = await createProviderReview(jwt, orderId, {
        rating,
        comment,
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("¡Gracias por tu evaluación!");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <main className={styles.mainContainer}>
            <Header title="Evaluación" showBackButton={false} />
            <div className={styles.container}>
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <IconsApp.Check color="#22c55e" />
                </div>
                <h2 className={styles.successTitle}>¡Evaluación enviada!</h2>
                <p className={styles.successText}>
                  Tu opinión ayuda a mejorar el servicio.
                </p>
              </div>
              <Button
                className={styles.submitButton}
                onClick={() => router.replace("/home/user")}
              >
                Volver al inicio
              </Button>
            </div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Evaluación" />

          <div className={styles.container}>
            <h1 className={styles.title}>¿Cómo fue tu experiencia?</h1>
            <p className={styles.subtitle}>
              Tu evaluación ayuda a otros usuarios a tomar mejores decisiones
            </p>

            <div className={styles.ratingSection}>
              <span className={styles.ratingLabel}>Califica al proveedor</span>
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className={styles.starButton}
                    onClick={() => setRating(star)}
                  >
                    {star <= rating ? (
                      <IconsApp.StarFilled />
                    ) : (
                      <IconsApp.Star />
                    )}
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <span className={styles.selectedRating}>
                  {rating === 1
                    ? "Muy malo"
                    : rating === 2
                      ? "Malo"
                      : rating === 3
                        ? "Regular"
                        : rating === 4
                          ? "Bueno"
                          : "Excelente"}
                </span>
              )}
            </div>

            <div className={styles.commentSection}>
              <label className={styles.commentLabel}>
                Cuéntanos más sobre tu experiencia (opcional)
              </label>
              <textarea
                className={styles.commentInput}
                placeholder="Tu opinión nos ayuda a mejorar..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
              />
            </div>

            <Button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={rating === 0 || submitting}
            >
              {submitting ? "Enviando..." : "Enviar evaluación"}
            </Button>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
