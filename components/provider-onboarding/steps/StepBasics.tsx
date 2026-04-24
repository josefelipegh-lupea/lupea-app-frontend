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
      <label className={styles.label}>Nombre de usuario (Único)</label>      <div className={` ${errors?.username ? styles.inputError : ""}`}>
        <InputField
          name="username"
          className={styles.inputMargin}
          value={formData.username}
          onChange={handleChange}
          placeholder="ejemplo123"
          disabled
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
          disabled
          icon={<IconsApp.Email />}
        />
      </div>
      {errors?.email && <p className={styles.errorMessage}>{errors.email}</p>}
    </div>

    {/* Campo: Razón Social */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Razón Social <span className={styles.required}>*</span></label>
      <div className={` ${errors?.businessName ? styles.inputError : ""}`}>
        <InputField
          name="businessName"
          className={styles.inputMargin}
          value={formData.businessName}
          onChange={handleChange}
          placeholder="Nombre de la empresa"
          icon={<IconsApp.Business />}
        />
      </div>
      {errors?.businessName && (
        <p className={styles.errorMessage}>{errors.businessName}</p>
      )}
    </div>

    {/* Campo: WhatsApp */}
    <div className={styles.fieldGroup}>
      <label className={styles.label}>Teléfono <span className={styles.required}>*</span></label>
      <div className={` ${errors?.phoneNumber ? styles.inputError : ""}`}>
        <InputField
          name="phoneNumber"
          className={styles.inputMargin}
          value={formData.phoneNumber}
          onChange={handleChange}
          placeholder="+58 412 0000000"
          icon={<IconsApp.Whatsapp />}
        />
      </div>
      {errors?.phoneNumber && <p className={styles.errorMessage}>{errors.phoneNumber}</p>}
    </div>
  </div>
);

export default StepBasics;
