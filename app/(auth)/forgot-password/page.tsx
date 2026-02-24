"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ForgotPassword.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { toast } from "react-hot-toast";
import { forgotPassword } from "@/app/lib/api/auth";
import { useForgotPasswordValidation } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const { isValid } = useForgotPasswordValidation({ email });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Ingresa tu correo electrónico");

    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Correo enviado correctamente");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de validación";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bgWrapper}>
      <button
        onClick={() => router.replace("/login")}
        className={styles.backButton}
        aria-label="Volver"
      >
        <IconsApp.Back />
      </button>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>¿Olvidaste tu contraseña?</h1>
          <p className={styles.subtitle}>
            {sent
              ? "Si la cuenta existe, recibirás un correo con las instrucciones para restablecerla."
              : "Ingresa tu correo para enviarte un enlace de recuperación."}
          </p>
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Correo electrónico</label>
              <div className={styles.inputWrapper}>
                <span className={styles.icon}>
                  <IconsApp.Email />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="ejemplo@correo.com"
                  className={styles.input}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={styles.mainButton}
              disabled={loading || !isValid}
            >
              {loading ? "Enviando..." : "Enviar instrucciones"}
            </button>
          </form>
        ) : (
          <button
            className={styles.mainButton}
            onClick={() => router.replace("/login")}
          >
            Volver al inicio de sesión
          </button>
        )}
      </div>
    </div>
  );
}
