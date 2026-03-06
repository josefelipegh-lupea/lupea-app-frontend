"use client";

import React, { useState } from "react";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import InputField from "@/components/input/InputField";
import { uploadProviderDocument } from "@/app/lib/api/vendor/vendorProfile";
import toast from "react-hot-toast";

interface StepDocumentsProps {
  selectedFiles: { [key: string]: File | null };
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<{ [key: string]: File | null }>
  >;
  jwt: string;
}

const StepDocuments: React.FC<StepDocumentsProps> = ({
  selectedFiles,
  setSelectedFiles,
  jwt,
}) => {
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});

  const requiredDocs = [
    {
      id: "registry",
      label: "Acta Constitutiva o Registro",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "assembly",
      label: "Última Acta de Asamblea",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "rif",
      label: "RIF Obligatorio",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "legal_id",
      label: "CI del Representante Legal",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
  ];

  const handleFileChange = async (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 1. Actualizar estado local para mostrar el nombre en la UI
    setSelectedFiles((prev) => ({ ...prev, [id]: file }));

    // 2. Iniciar subida al servidor
    setUploading((prev) => ({ ...prev, [id]: true }));

    try {
      await uploadProviderDocument(jwt, id, file);
      toast.success(`${file.name} subido con éxito`);
    } catch (error) {
      console.error(error);
      toast.error(`Error: ${error}`);
      // Opcional: limpiar el archivo si falló la subida
      setSelectedFiles((prev) => ({ ...prev, [id]: null }));
    } finally {
      setUploading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className={styles.gridContainer}>
      <p className={`${styles.fullWidth} ${styles.helperText}`}>
        Formatos permitidos: PDF, JPG, PNG
      </p>

      {requiredDocs.map((doc) => {
        const file = selectedFiles[doc.id];
        const isUploading = uploading[doc.id];

        return (
          <div
            key={doc.id}
            className={`${styles.inputWrapper} ${styles.inputDoc}`}
          >
            <div className={styles.inputInner}>
              <span className={styles.iconDoc}>{doc.icon}</span>
              <span
                className={`${styles.input} ${file ? styles.fileSelected : ""}`}
              >
                {isUploading ? "Subiendo..." : file ? file.name : doc.label}
              </span>
            </div>

            <label
              className={`${styles.addBtn} ${
                isUploading ? styles.disabled : ""
              }`}
            >
              {isUploading ? "..." : file ? "CAMBIAR" : "SUBIR"}

              <InputField
                type="file"
                name="file"
                hidden
                disabled={isUploading}
                accept=".pdf,.jpg,.png"
                onChange={(e) => handleFileChange(doc.id, e)}
              />
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default StepDocuments;
