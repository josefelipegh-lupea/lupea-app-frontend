"use client";
import React, { useState } from "react";
import styles from "./PersonalInfo.module.css";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";

export default function PersonalInfoPage() {
  const [isEditing, setIsEditing] = useState(false);
  const { isExpanded } = useSidebar();

  // Estado inicial incluyendo el campo obligatorio de privacidad
  const [formData, setFormData] = useState({
    first_name: "Cristian",
    last_name: "Ramirez",
    username: "Cristian1739",
    email: "cristian@ejemplo.com",
    phone: "+58 412 1234567",
    privacy_level: "private", // Default requerido por la HU
  });

  // Validación: Todos los campos marcados como obligatorios en la HU19
  const isFormValid = !!(
    formData.first_name &&
    formData.last_name &&
    formData.username &&
    formData.email &&
    formData.phone &&
    formData.privacy_level
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    // Aquí se activaría el cambio a estado "verificado"
    setIsEditing(false);
    console.log("Perfil actualizado y verificado:", formData);
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        <header className={styles.header}>
          <button
            className={styles.backButton}
            onClick={() => window.history.back()}
          >
            <IconsApp.RightArrow />
          </button>
          <h1 className={styles.headerTitle}>Información personal</h1>
          <div className={styles.headerAction}>
            {!isEditing && (
              <button
                className={styles.btnEditDesktop}
                onClick={() => setIsEditing(true)}
              >
                Editar
              </button>
            )}
          </div>
        </header>

        <div className={styles.content}>
          {/* Aviso de perfil incompleto según HU19 flujo principal */}
          {!isFormValid && (
            <div className={styles.alertBanner}>
              Completa tu perfil para acceder a todas las funciones de Lupea.
            </div>
          )}
          {/* Contenedor para manejar las columnas en desktop */}
          <div className={styles.layoutContent}>
            {/* DIV COLUMNA IZQUIERDA */}
            <div className={styles.columnLeft}>
              <section className={styles.formSection}>
                <div className={styles.sectionHeader}>
                  <p className={styles.sectionLabel}>DATOS DE IDENTIFICACIÓN</p>
                  {!isEditing && (
                    <button
                      className={styles.btnEdit}
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </button>
                  )}
                </div>

                {[
                  { label: "Nombre", name: "first_name" },
                  { label: "Apellido", name: "last_name" },
                  { label: "Nombre de usuario", name: "username" },
                ].map((field) => (
                  <div key={field.name} className={styles.inputContainer}>
                    <label className={styles.label}>{field.label}</label>
                    <input
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={styles.input}
                    />
                  </div>
                ))}
              </section>
            </div>

            {/* DIV COLUMNA DERECHA */}
            <div className={styles.columnRight}>
              <section className={styles.formSection}>
                <p className={styles.sectionLabel}>CONTACTO</p>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Correo electrónico</label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Teléfono / WhatsApp</label>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                  />
                </div>
              </section>

              <section className={styles.formSection}>
                <p className={styles.sectionLabel}>SEGURIDAD Y PRIVACIDAD</p>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Nivel de Privacidad</label>
                  <div className={styles.selectWrapper}>
                    <select
                      name="privacy_level"
                      value={formData.privacy_level}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={styles.selectInput}
                    >
                      <option value="private">Privado</option>
                      <option value="semi_public">Semipúblico</option>
                      <option value="public">Público</option>
                    </select>
                  </div>
                  <p className={styles.helperText}>
                    Define la visibilidad de tus datos para los proveedores.
                  </p>
                </div>
              </section>
            </div>
          </div>{" "}
          {/* Botones de acción agrupados */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.btnSave}
              disabled={!isEditing || !isFormValid}
              onClick={handleSave}
            >
              Guardar cambios
            </button>

            <button
              className={`${styles.btnCancel} ${
                isEditing ? styles.btnCancelVisible : ""
              }`}
              onClick={() => setIsEditing(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
