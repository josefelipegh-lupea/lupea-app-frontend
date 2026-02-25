"use client";

import { useState } from "react";

import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import { useRegisterValidation } from "@/hooks/useRegisterValidation";

import styles from "./RegisterUser.module.css";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";
import { registerClient } from "@/app/lib/api/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { isValid } = useRegisterValidation({
    username,
    email,
    password,
    termsAccepted,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const loadingToast = toast.loading("Creando tu cuenta...");

    try {
      const data = await registerClient(
        username,
        email,
        password,
        termsAccepted
      );

      toast.success(data.message, { id: loadingToast, duration: 6000 });

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Ocurrió un error inesperado";

      toast.error(errorMessage, {
        id: loadingToast,
      });
      setIsLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (open) {
        document.dispatchEvent(new CustomEvent("close-sheet"));
      }
    }
    router.replace("/login");
  };

  return (
    <div className={styles.bgWrapper} onClick={handleBackdropClick}>
      <button type="button" className={styles.backButton} aria-label="Volver">
        <IconsApp.Back />
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        onAnimationComplete={() => router.replace("/login")}
      >
        <input
          type="text"
          name="chrome-bug-preventer"
          style={{ display: "none" }}
        />
        <div className={styles.formBar} />
        <h1 className={styles.title}>Registrarme</h1>
        <p className={styles.subtitle}>Ingresa tus datos para registrarte</p>

        <label className={styles.label} htmlFor="register-name">
          Nombre de usuario
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <IconsApp.Username />
          </span>
          <input
            id="register-name"
            className={`${styles.input} 
            `}
            name="register-name"
            type="text"
            placeholder="usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="new-password"
            required
          />
        </div>

        <label className={styles.label} htmlFor="email">
          Correo electrónico
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <IconsApp.Email />
          </span>
          <input
            id="email"
            className={`${styles.input} `}
            type="email"
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <label className={styles.label} htmlFor="password">
          Contraseña
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <IconsApp.Password />
          </span>
          <input
            id="password"
            className={`${styles.input} `}
            type={showPassword ? "text" : "password"}
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            required
          />
          <button
            type="button"
            className={styles.eyeButton}
            tabIndex={-1}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            onClick={() => setShowPassword((v) => !v)}
          >
            {!showPassword ? (
              <IconsApp.EyePassword />
            ) : (
              <IconsApp.EyePasswordOff />
            )}
          </button>
        </div>

        <div className={styles.termsRow}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className={styles.checkboxInput}
              required
            />
            <span className={styles.customCheckbox} aria-hidden="true" />
            <span className={styles.termsText}>
              Acepto los{" "}
              <a href="#" className={styles.termsLink}>
                Términos y condiciones
              </a>
            </span>
          </label>
        </div>

        <button
          className={styles.submitButton}
          disabled={!isValid || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? "Registrando..." : "Registrarme"}
        </button>

        <div className={styles.loginRow}>
          <span>¿Ya tienes una cuenta? </span>
          <a href="/login" className={styles.loginLink}>
            Iniciar sesión
          </a>
        </div>
      </BottomSheet>
    </div>
  );
}
