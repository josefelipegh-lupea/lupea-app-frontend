"use client";

import { useState } from "react";
import Image from "next/image";

import BottomSheet from "@/components/bottom-sheet/BottomSheet";

import { useLoginValidation } from "@/hooks/useLoginValidation";

import styles from "./Login.module.css";
import { useRouter } from "next/navigation";
import { loginClient } from "@/app/lib/api/auth";
import { IconsApp } from "@/components/icons/Icons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(true);
  const [loading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();

  const { isValid } = useLoginValidation({
    email,
    password,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError("");

    try {
      const data = await loginClient(email, password);
      localStorage.setItem("jwt", data.jwt);
      router.push("/profile/user");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message);
        console.log(err);
      } else {
        setApiError("Ocurrió un error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && open) {
      document.dispatchEvent(new CustomEvent("close-sheet"));
    }
  };

  return (
    <div className={styles.bgWrapper} onClick={handleBackdropClick}>
      <div className={styles.logoContainer}>
        <Image
          src="/lupea-logo.png"
          alt="Lupea Logo"
          className={styles.logo}
          width={350}
          height={350}
        />
      </div>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        className={styles.loginSheetHeight}
      >
        <div className={styles.formBar} />

        <h1 className={styles.title}>Iniciar Sesión</h1>
        <p className={styles.subtitle}>Ingresa tus datos para continuar</p>

        {/* IDENTIFICADOR */}
        <label className={styles.label} htmlFor="email">
          Correo electrónico o usuario
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <IconsApp.Email />
          </span>
          <input
            id="email"
            className={styles.input}
            type="text"
            placeholder="usuario@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off-no-fill"
            required
          />
        </div>

        {/* CONTRASEÑA */}
        <label className={styles.label} htmlFor="password">
          Contraseña
        </label>
        <div className={styles.inputWrapper}>
          <span className={styles.inputIcon}>
            <IconsApp.Password />
          </span>
          <input
            id="password"
            className={styles.input}
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
            {showPassword ? (
              <IconsApp.EyePassword />
            ) : (
              <IconsApp.EyePasswordOff />
            )}
          </button>
        </div>

        {/* OLVIDÉ MI CONTRASEÑA */}
        <div className={styles.forgotPasswordRow}>
          <a href="#" className={styles.forgotPasswordLink}>
            Olvidé mi contraseña
          </a>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!isValid || loading}
        >
          {loading ? "Cargando..." : "Iniciar Sesión"}
        </button>

        <div className={styles.loginRow}>
          <span>¿No tienes una cuenta? </span>
          <a href="/user/register" className={styles.loginLink}>
            Regístrate aquí
          </a>
        </div>
      </BottomSheet>
    </div>
  );
}
