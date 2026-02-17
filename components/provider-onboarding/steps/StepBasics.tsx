import React from "react";
import { StepProps } from "@/components/provider-onboarding/types";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";

interface ExtendedStepProps extends StepProps {
  errors?: Record<string, string>;
}

const StepBasics: React.FC<ExtendedStepProps> = ({
  formData,
  handleChange,
  errors,
}) => (
  <div className={styles.gridContainer}>
    {/* Campo: Username */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Nombre de usuario (Único)</label>
      <div
        className={`${styles.inputWrapper} ${
          errors?.username ? styles.inputError : ""
        }`}
      >
        <span className={styles.icon}>
          <IconsApp.Username />
        </span>
        <input
          className={styles.input}
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="ejemplo123"
        />
      </div>
      {errors?.username && (
        <p className={styles.errorMessage}>{errors.username}</p>
      )}
    </div>

    {/* Campo: Email */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Correo comercial (Único)</label>
      <div
        className={`${styles.inputWrapper} ${
          errors?.email ? styles.inputError : ""
        }`}
      >
        <span className={styles.icon}>
          <IconsApp.Email />
        </span>
        <input
          className={styles.input}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="negocio@correo.com"
        />
      </div>
      {errors?.email && <p className={styles.errorMessage}>{errors.email}</p>}
    </div>

    {/* Campo: Razón Social */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Razón Social</label>
      <div
        className={`${styles.inputWrapper} ${
          errors?.business_name ? styles.inputError : ""
        }`}
      >
        <span className={styles.icon}>
          <IconsApp.Business />
        </span>
        <input
          className={styles.input}
          name="business_name"
          value={formData.business_name}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
        />
      </div>
      {errors?.business_name && (
        <p className={styles.errorMessage}>{errors.business_name}</p>
      )}
    </div>

    {/* Campo: WhatsApp */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>WhatsApp Comercial</label>
      <div
        className={`${styles.inputWrapper} ${
          errors?.phone ? styles.inputError : ""
        }`}
      >
        <span className={styles.icon}>
          <IconsApp.Whatsapp />
        </span>
        <input
          className={styles.input}
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+58 412 0000000"
        />
      </div>
      {errors?.phone && <p className={styles.errorMessage}>{errors.phone}</p>}
    </div>
  </div>
);

export default StepBasics;
