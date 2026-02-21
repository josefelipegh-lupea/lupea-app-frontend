"use client"; // Asegúrate de tener esto arriba si usas App Router

import React from "react";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import InputField from "@/components/input/InputField";

interface StepDocumentsProps {
  selectedFiles: { [key: string]: string };
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
}

const StepDocuments: React.FC<StepDocumentsProps> = ({
  selectedFiles,
  setSelectedFiles,
}) => {
  const requiredDocs = [
    {
      id: "acta",
      label: "Acta Constitutiva o Registro",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "asamblea",
      label: "Última Acta de Asamblea",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "rif",
      label: "RIF Obligatorio",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
    {
      id: "ci",
      label: "CI del Representante Legal",
      icon: <IconsApp.Document color="#A9A9A9" />,
    },
  ];

  const handleFileChange = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]; // Obtenemos el primer archivo
    if (file) {
      setSelectedFiles((prev) => ({
        ...prev,
        [id]: file.name, // Guardamos solo el nombre vinculado al ID
      }));
    }
  };

  return (
    <div className={styles.gridContainer}>
      <p className={`${styles.fullWidth} ${styles.helperText}`}>
        Formatos permitidos: PDF, JPG, PNG
      </p>

      {requiredDocs.map((doc) => {
        const fileName = selectedFiles[doc.id];

        return (
          <div
            key={doc.id}
            className={`${styles.inputWrapper} ${styles.inputDoc}`}
          >
            <div className={styles.inputInner}>
              <span className={styles.icon}>{doc.icon}</span>

              <span
                className={`${styles.input} ${
                  fileName ? styles.fileSelected : ""
                }`}
              >
                {fileName ? fileName : doc.label}
              </span>
            </div>

            <label className={styles.addBtn}>
              {fileName ? "CAMBIAR" : "SUBIR"}

              <InputField
                type="file"
                name="file"
                hidden
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
