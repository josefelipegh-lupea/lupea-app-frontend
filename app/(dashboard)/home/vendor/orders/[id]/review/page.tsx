"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { createClientReview } from "@/app/lib/api/client/review";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "../../../../user/orders/[id]/review/Review.module.css";
import Header from "@/components/header/Header";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";
import Button from "@/components/button/Button";

export default function VendorClientReviewPage() {
  const { id: orderId } = useParams() as { id: string };
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !jwt) return;

    setSubmitting(true);
    try {
      const res = await createClientReview(jwt, orderId, {
        rating,
        comment,
      });

      if (res.ok) {
        setSubmitted(true);
        toast.success("Gracias por tu evaluacion");
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
            <Header title="Evaluacion" showBackButton={false} />
            <div className={styles.container}>
              <div className={styles.successMessage}>
                <div className={styles.successIcon}>
                  <IconsApp.Check color="#22c55e" />
                </div>
                <h2 className={styles.successTitle}>Evaluacion enviada</h2>
                <p className={styles.successText}>
                  Tu opinion ayuda a mejorar la experiencia en Lupea.
                </p>
              </div>
              <Button
                className={styles.submitButton}
                onClick={() => router.replace("/home/vendor")}
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
          <Header title="Evaluacion" />

          <div className={styles.container}>
            <h1 className={styles.title}>Como fue tu experiencia con el cliente?</h1>
            <p className={styles.subtitle}>
              Tu evaluacion ayudara a construir una mejor reputacion dentro de la plataforma.
            </p>

            <div className={styles.ratingSection}>
              <span className={styles.ratingLabel}>Califica al cliente</span>
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
            </div>

            <div className={styles.commentSection}>
              <label className={styles.commentLabel}>
                Comentario adicional (opcional)
              </label>
              <textarea
                className={styles.commentInput}
                placeholder="Describe tu experiencia con el cliente..."
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
              {submitting ? "Enviando..." : "Enviar evaluacion"}
            </Button>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
