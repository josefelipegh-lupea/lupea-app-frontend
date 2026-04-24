"use client";

import React, { useState } from "react";
import Header from "@/components/header/Header";
import Button from "@/components/button/Button";
import { IconsApp } from "@/components/icons/Icons";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import styles from "./ChangePassword.module.css";
import { updateClientPassword } from "@/app/lib/api/client/clientProfile";
import { useSidebar } from "@/context/SidebarContext";
import { useRouter } from "next/navigation";

export default function PasswordPage() {
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const { jwt } = useAuth();
  const [loading, setLoading] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const newFieldErrors: Record<string, string> = {};
    if (!formData.currentPassword) newFieldErrors.currentPassword = "Ingresa tu contraseña actual";
    if (!formData.newPassword) newFieldErrors.newPassword = "Ingresa una nueva contraseña";
    else if (formData.newPassword.length < 8) newFieldErrors.newPassword = "Debe tener al menos 8 caracteres";
    if (!formData.confirmPassword) newFieldErrors.confirmPassword = "Confirma tu nueva contraseña";
    else if (formData.newPassword !== formData.confirmPassword) newFieldErrors.confirmPassword = "Las contraseñas no coinciden";

    setFieldErrors(newFieldErrors);
    if (Object.keys(newFieldErrors).length > 0) return;

    setLoading(true);
    try {
      if (!jwt) return;
      const response = await updateClientPassword(jwt, {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      toast.success(response.message || "Contraseña actualizada", {
        duration: 10000,
      });

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      router.replace("/profile/user");
    } catch (error: unknown) {
      let toastMessage = "Ocurrió un error inesperado";

      if (error instanceof Error) {
        toastMessage = error.message;
      } else if (typeof error === "string") {
        toastMessage = error;
      }

      toast.error(toastMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        <Header title="Cambiar clave" />

        <form onSubmit={handleUpdate} className={styles.formContent}>
          <div className={styles.infoSection}>
            <p>Elige una contraseña segura para proteger tu cuenta.</p>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="currentPassword">
              Contraseña Actual <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Password />
              </span>
              <input
                id="currentPassword"
                name="currentPassword"
                className={styles.input}
                type={showCurrent ? "text" : "password"}
                placeholder="********"
                value={formData.currentPassword}
                onChange={handleChange}
                autoComplete="off"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowCurrent(!showCurrent)}
                tabIndex={-1}
              >
                {!showCurrent ? (
                  <IconsApp.EyePassword />
                ) : (
                  <IconsApp.EyePasswordOff />
                )}
              </button>
            </div>
            {fieldErrors.currentPassword && (
              <p className={styles.fieldError}>{fieldErrors.currentPassword}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="newPassword">
              Nueva Contraseña <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Password />
              </span>
              <input
                id="newPassword"
                name="newPassword"
                className={styles.input}
                type={showNew ? "text" : "password"}
                placeholder="********"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowNew(!showNew)}
                tabIndex={-1}
              >
                {!showNew ? (
                  <IconsApp.EyePassword />
                ) : (
                  <IconsApp.EyePasswordOff />
                )}
              </button>
            </div>
            {fieldErrors.newPassword && (
              <p className={styles.fieldError}>{fieldErrors.newPassword}</p>
            )}
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="confirmPassword">
              Confirmar Nueva Contraseña <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Password />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                className={styles.input}
                type={showConfirm ? "text" : "password"}
                placeholder="********"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {!showConfirm ? (
                  <IconsApp.EyePassword />
                ) : (
                  <IconsApp.EyePasswordOff />
                )}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <p className={styles.fieldError}>{fieldErrors.confirmPassword}</p>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <Button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? "Actualizando..." : "Actualizar contraseña"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
