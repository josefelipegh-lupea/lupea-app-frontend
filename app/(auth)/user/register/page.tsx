"use client";

import { useState } from "react";

import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import { useRegisterValidation } from "@/hooks/useRegisterValidation";

import styles from "./RegisterUser.module.css";
import { IconsApp } from "@/components/icons/Icons";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);

  const { isValid } = useRegisterValidation({
    username,
    email,
    password,
    termsAccepted,
  });

  const handleBackdropClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (open) {
        document.dispatchEvent(new CustomEvent("close-sheet"));
      }
    }
  };

  return (
    <div className={styles.bgWrapper} onClick={handleBackdropClick}>
      <button type="button" className={styles.backButton} aria-label="Volver">
        <IconsApp.Back />
      </button>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
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

        {/* EMAIL */}
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

        {/* PASSWORD */}
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

        {/* TERMS */}
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
          type="submit"
          className={styles.submitButton}
          disabled={!isValid}
        >
          Registrarme
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
