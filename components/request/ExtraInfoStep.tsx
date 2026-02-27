"use client";

import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { FormData } from "@/app/(dashboard)/home/user/request/page";
import { useRef } from "react";

interface ExtraInfoStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export default function ExtraInfoStep({
  formData,
  setFormData,
}: ExtraInfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, extraInfo: e.target.value }));
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Camera color="#f58220"/>
          </div>
        </div>
        <h2 className={styles.cardTitle}>Información Extra</h2>
      </div>

      <div className={styles.divider} />

      <div className={styles.cardBody}>
        {/* Dropzone / Upload Area */}
        <div className={styles.uploadArea} onClick={handlePhotoClick}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: "none" }}
            accept="image/*"
          />
          <div className={styles.uploadIconCircle}>
            <IconsApp.CameraPlus color="#9CA3AF" />
          </div>
          <p className={styles.uploadTitle}>
            {formData.photo ? formData.photo.name : "Subir foto de referencia"}
          </p>
          <p className={styles.uploadSubtitle}>
            Ayuda a identificar la pieza exacta
          </p>
        </div>

        {/* Textarea Notas */}
        <div className={styles.field} style={{ marginTop: "20px" }}>
          <label>Nombre del repuesto</label>{" "}
          {/* Nota: En tu imagen dice "Nombre del repuesto", pero el placeholder indica una descripción */}
          <textarea
            className={styles.textarea}
            placeholder="Ej: Necesito que sea compatible con la versión Sport..."
            value={formData.extraInfo}
            onChange={handleTextChange}
          />
        </div>
      </div>
    </section>
  );
}
