"use client";

import React from "react";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";

interface StepDocumentsProps {
  selectedFiles: { [key: string]: File | null };
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<{ [key: string]: File | null }>
  >;
  // jwt ya no es estrictamente necesario aquí si no subimos al momento,
  // pero lo dejamos por si tu interfaz StepProps lo requiere.
  jwt?: string;
}

const StepDocuments: React.FC<StepDocumentsProps> = ({
  selectedFiles,
  setSelectedFiles,
}) => {
  const requiredDocs = [
    { id: "registry", label: "Acta Constitutiva o Registro" },
    { id: "assembly", label: "Última Acta de Asamblea" },
    { id: "rif", label: "RIF Obligatorio" },
    { id: "legal_id", label: "CI del Representante Legal" },
  ];

  const handleFileChange = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (5MB) para no tener problemas en el paso final
    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo excede los 5MB permitidos");
      // Limpiamos el input para que pueda re-seleccionar
      event.target.value = "";
      return;
    }

    // Solo guardamos en el estado del padre. La "magia" de la subida
    // ocurrirá en handleNextStep cuando currentStep === 5.
    setSelectedFiles((prev) => ({ ...prev, [id]: file }));
    toast.success(`Archivo "${file.name}" listo para subir`);
  };

  return (
    <div className={styles.gridContainer}>
      <div className={styles.fullWidth}>
        <p className={styles.helperText}>
          Formatos permitidos <strong>PDF, JPG o PNG</strong>
          .
          <br />
        </p>
      </div>

      {requiredDocs.map((doc) => {
        const file = selectedFiles[doc.id];

        return (
          <div
            key={doc.id}
            className={`${styles.inputWrapper} ${styles.inputDoc} ${
              file ? styles.docActive : ""
            }`}
          >
            <div className={styles.inputInner}>
              <span className={styles.iconDoc}>
                <IconsApp.Document color={file ? "#2ecc71" : "#A9A9A9"} />
              </span>
              <span
                className={`${styles.input} ${file ? styles.fileSelected : ""}`}
              >
                {file ? file.name : doc.label}
              </span>
            </div>

            <label
              className={`${styles.addBtn} ${file ? styles.btnChange : ""}`}
            >
              {file ? "CAMBIAR" : "SELECCIONAR"}
              <input
                type="file"
                name={doc.id}
                hidden
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleFileChange(doc.id, e)}
                style={{ display: "none" }}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default StepDocuments;
