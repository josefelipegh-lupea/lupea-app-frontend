"use client";

import React, { useMemo, useEffect } from "react";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import toast from "react-hot-toast";
import Image from "next/image";

interface StepDocumentsProps {
  selectedFiles: { [key: string]: File | null };
  setSelectedFiles: React.Dispatch<
    React.SetStateAction<{ [key: string]: File | null }>
  >;
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

  const previews = useMemo(() => {
    const result: { [key: string]: string } = {};
    requiredDocs.forEach((doc) => {
      const file = selectedFiles[doc.id];
      if (file && file.type.startsWith("image/")) {
        result[doc.id] = URL.createObjectURL(file);
      }
    });
    return result;
  }, [selectedFiles]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  const handleFileChange = (
    id: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("El archivo excede los 5MB permitidos");
      event.target.value = "";
      return;
    }

    setSelectedFiles((prev) => ({ ...prev, [id]: file }));
    toast.success(`Archivo cargado correctamente`);
  };

  return (
    <div className={styles.gridContainer}>
      <div className={styles.fullWidth}>
        <p className={styles.helperText}>
          Formatos permitidos <strong>PDF, JPG o PNG</strong> (Máx. 5MB)
        </p>
      </div>

      {requiredDocs.map((doc) => {
        const file = selectedFiles[doc.id];
        const hasPreview = previews[doc.id];

        return (
          <div key={doc.id} className={styles.fieldGroup}>
            <label className={styles.label}>{doc.label}</label>
            
            <div className={`${styles.input} ${styles.inputDocContainer} ${file ? styles.docActive : ""}`}>
              <div className={styles.inputInner}>
                <div className={styles.iconContainer}>
                  {hasPreview ? (
                    <div className={styles.thumbnailWrapper}>
                      <Image 
                        src={previews[doc.id]} 
                        alt="Preview" 
                        fill 
                        className={styles.thumbnail}
                      />
                    </div>
                  ) : (
                    <IconsApp.Document color={file ? "#2ecc71" : "#A9A9A9"} />
                  )}
                </div>
                
                <span className={`${styles.fileName} ${file ? styles.fileSelected : ""}`}>
                  {file ? file.name : "Seleccionar archivo..."}
                </span>
              </div>

              <label className={styles.fileActionBtn}>
                {file ? "CAMBIAR" : "SUBIR"}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.png"
                  onChange={(e) => handleFileChange(doc.id, e)}
                />
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StepDocuments;