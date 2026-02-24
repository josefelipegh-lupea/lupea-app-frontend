"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResetPasswordValidation } from "@/hooks/useResetPasswordValidation";
import { IconsApp } from "@/components/icons/Icons";
import { toast } from "react-hot-toast";
import styles from "./ResetPassword.module.css";
import { resetPassword } from "@/app/lib/api/auth";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("token");

  const [values, setValues] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const { isValid, errors } = useResetPasswordValidation(values);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !code) {
      if (!code) toast.error("Código de recuperación no encontrado");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(code, values.password);
      toast.success("¡Contraseña actualizada!");
      router.replace("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error de validación";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.bgWrapper}>
      {/* Botón Volver fuera del card */}
      <button
        onClick={() => router.replace("/login")}
        className={styles.backButtonFixed}
      >
        <IconsApp.Back />
      </button>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h1 className={styles.title}>Nueva contraseña</h1>
          <p className={styles.subtitle}>Ingresa tu nueva clave de acceso</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>Contraseña nueva</label>
            <div className={styles.inputWrapper}>
              <span className={styles.icon}>
                <IconsApp.Password />
              </span>
              <input
                name="password"
                type="password"
                className={styles.input}
                value={values.password}
                onChange={handleChange}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Confirmar contraseña</label>
            <div className={styles.inputWrapper}>
              <span className={styles.icon}>
                <IconsApp.Password />
              </span>
              <input
                name="confirmPassword"
                type="password"
                className={styles.input}
                value={values.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
              />
            </div>
            {values.confirmPassword && errors.confirmPassword && (
              <span className={styles.errorText}>
                {errors.confirmPassword[0]}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={styles.mainButton}
            disabled={loading || !isValid}
          >
            {loading ? "Actualizando..." : "Restablecer contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}
