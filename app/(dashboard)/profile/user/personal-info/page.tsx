"use client";
import React, { useEffect, useState } from "react";
import styles from "./PersonalInfo.module.css";
import { useSidebar } from "@/context/SidebarContext";
import Button from "@/components/button/Button";
import Header from "@/components/header/Header";
import InputField from "@/components/input/InputField";
import {
  ClientProfileResponse,
  updateClientProfile,
} from "@/app/lib/api/client/clientProfile";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import { ProfileValues } from "@/schemas/profileSchema";
import { useProfileValidation } from "@/hooks/useProfileValidation";
import { IconsApp } from "@/components/icons/Icons";

export default function PersonalInfoPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { profile, role, refreshProfile, jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [formData, setFormData] = useState<ProfileValues>({
    displayName: "",
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
  });

  const { isValid, errors } = useProfileValidation(formData);
  const [submitted, setSubmitted] = useState(false);

  const hydrateFormData = (profileData: ClientProfileResponse) => {
    setFormData({
      displayName: profileData.displayName || "",
      firstName: profileData.firstName || "",
      lastName: profileData.lastName || "",
      email: profileData.email || "",
      username: profileData.username || "",
      phone: profileData.phone || "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "firstName" || name === "lastName") {
      newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, "");
    }

    if (name === "phone") {
      const cleanNumbers = value.replace(/\D/g, "");
      if (!value.startsWith("+58")) {
        newValue = "+58" + cleanNumbers;
      } else {
        newValue = "+58" + value.substring(3).replace(/\D/g, "");
      }

      if (newValue.length > 13) return;
    }

    setFormData({ ...formData, [name]: newValue });
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (!isValid || !jwt) return;

    setIsSaving(true);
    try {
      await updateClientProfile(jwt, formData);
      await refreshProfile();
      toast.success("Perfil actualizado");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (role === "client" && profile) {
      const p = profile as ClientProfileResponse;
      hydrateFormData(p);
    }
  }, [profile, role]);

  const handleCancel = () => {
    if (role === "client" && profile) {
      hydrateFormData(profile as ClientProfileResponse);
    }
    setSubmitted(false);
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        <Header title="Información personal" />

        <div className={styles.content}>
          {/* Aviso de perfil incompleto según HU19 flujo principal */}
          {profile?.status === "incomplete" && (
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
                </div>

                {[
                  {
                    label: "Nombre de usuario",
                    name: "username",
                    icon: <IconsApp.Username />,
                    required: false,
                  },
                  {
                    label: "Nombre",
                    name: "firstName",
                    icon: <IconsApp.Username />,
                    required: true,
                  },
                  {
                    label: "Apellido",
                    name: "lastName",
                    icon: <IconsApp.Username />,
                    required: true,
                  },
                ].map((field) => (
                  <div key={field.name} className={styles.inputContainer}>
                    <label className={styles.label}>
                      {field.label}{" "}
                      {field.required && <span className={styles.required}>*</span>}
                    </label>

                    <InputField
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleChange}
                      icon={field.icon}
                      disabled={field.name === "username"}
                    />
                    {submitted && errors[field.name as keyof typeof errors] && (
                      <p className={styles.fieldError}>
                        {(errors[field.name as keyof typeof errors] as string[])[0]}
                      </p>
                    )}
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

                  <InputField
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    icon={<IconsApp.Email />}
                    disabled
                  />
                </div>
                <div className={styles.inputContainer}>
                  <label className={styles.label}>Teléfono / WhatsApp <span className={styles.required}>*</span></label>

                  <InputField
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    icon={<IconsApp.Whatsapp />}
                  />
                  {submitted && errors.phone && (
                    <p className={styles.fieldError}>{errors.phone[0]}</p>
                  )}
                </div>
              </section>
            </div>
          </div>{" "}
          {/* Botones de acción agrupados */}
          <div className={styles.buttonGroup}>
            <Button
              className={styles.btnSave}
              disabled={!isValid || isSaving}
              onClick={handleSave}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>

            <button className={styles.btnCancel} onClick={handleCancel}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
