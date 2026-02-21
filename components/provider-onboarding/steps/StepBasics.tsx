import React from "react";
import { StepProps } from "@/components/provider-onboarding/types";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import InputField from "@/components/input/InputField";

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
      <div className={` ${errors?.username ? styles.inputError : ""}`}>
        <InputField
          name="username"
          className={styles.inputMargin}
          value={formData.username}
          onChange={handleChange}
          placeholder="ejemplo123"
          icon={<IconsApp.Username />}
        />
      </div>
      {errors?.username && (
        <p className={styles.errorMessage}>{errors.username}</p>
      )}
    </div>

    {/* Campo: Email */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Correo comercial (Único)</label>
      <div className={` ${errors?.email ? styles.inputError : ""}`}>
        <InputField
          name="email"
          type="email"
          className={styles.inputMargin}
          value={formData.email}
          onChange={handleChange}
          placeholder="negocio@correo.com"
          icon={<IconsApp.Email />}
        />
      </div>
      {errors?.email && <p className={styles.errorMessage}>{errors.email}</p>}
    </div>

    {/* Campo: Razón Social */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Razón Social</label>
      <div className={` ${errors?.business_name ? styles.inputError : ""}`}>
        <InputField
          name="business_name"
          className={styles.inputMargin}
          value={formData.business_name}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
          icon={<IconsApp.Business />}
        />
      </div>
      {errors?.business_name && (
        <p className={styles.errorMessage}>{errors.business_name}</p>
      )}
    </div>

    {/* Campo: WhatsApp */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>WhatsApp Comercial</label>
      <div className={` ${errors?.phone ? styles.inputError : ""}`}>
        <InputField
          name="phone"
          className={styles.inputMargin}
          value={formData.phone}
          onChange={handleChange}
          placeholder="+58 412 0000000"
          icon={<IconsApp.Whatsapp />}
        />
      </div>
      {errors?.phone && <p className={styles.errorMessage}>{errors.phone}</p>}
    </div>
  </div>
);

export default StepBasics;
