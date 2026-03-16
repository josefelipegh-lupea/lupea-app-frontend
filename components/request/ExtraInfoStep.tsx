"use client";

import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import {
  deleteQuoteItemImage,
  uploadQuoteItemImage,
} from "@/app/lib/api/request/request";
import { QuoteRequestFormData } from "@/hooks/useRequesFormAutoSave";

interface ExtraInfoStepProps {
  formData: QuoteRequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteRequestFormData>>;
  jwt: string;
  saveDraft: (data: QuoteRequestFormData) => void;
}

export default function ExtraInfoStep({
  formData,
  setFormData,
  jwt,
  saveDraft,
}: ExtraInfoStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Subiendo imagen...");

  const handlePhotoClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jwt) return;

    try {
      setLoadingMessage("Subiendo imagen...");
      setIsUploading(true);

      const res = await uploadQuoteItemImage(jwt, file);

      // Creamos el objeto actualizado
      const updatedData = {
        ...formData,
        photo: file, // El file vive en memoria
        photoUrl: res.data.image.url,
        photoId: res.data.image.id,
      };

      setFormData(updatedData);
      // Guardamos en borrador (saveDraft ya limpia el objeto 'photo' internamente)
      saveDraft(updatedData);

      toast.success(res.message, { duration: 10000 });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Error al subir imagen";
      toast.error(msg, { duration: 8000 });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const updatedData = { ...formData, extraInfo: value };

    setFormData(updatedData);
    saveDraft(updatedData);
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!formData.photoId || !jwt) return;

    try {
      setLoadingMessage("Eliminando imagen...");
      setIsUploading(true);

      const res = await deleteQuoteItemImage(jwt, formData.photoId);

      const updatedData = {
        ...formData,
        photo: null,
        photoUrl: undefined,
        photoId: undefined,
      };

      setFormData(updatedData);
      saveDraft(updatedData);

      toast.success(res.message, { duration: 10000 });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "No se pudo eliminar";
      toast.error(msg, { duration: 8000 });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Camera color="#f58220" />
          </div>
        </div>
        <h2 className={styles.cardTitle}>Información Extra</h2>
      </div>

      <div className={styles.divider} />

      <div className={styles.cardBody}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          style={{ display: "none" }}
          accept="image/*"
          disabled={isUploading}
        />

        <div
          className={`${styles.uploadArea} ${
            isUploading ? styles.uploading : ""
          }`}
          onClick={
            formData.photoUrl || isUploading ? undefined : handlePhotoClick
          }
        >
          {isUploading ? (
            <div className={styles.uploadIconCircle}>
              <span className={styles.loaderSmall} />
            </div>
          ) : formData.photoUrl ? (
            <div className={styles.thumbnailContainer}>
              <Image
                src={formData.photoUrl}
                alt="Vista previa"
                className={styles.thumbnailPreview}
                fill
                sizes="250px"
              />
              <button
                className={styles.removePhotoBadge}
                onClick={handleRemovePhoto}
                type="button"
              >
                <IconsApp.Trash color="#ef4444" />
              </button>
            </div>
          ) : (
            <div className={styles.uploadIconCircle}>
              <IconsApp.CameraPlus color="#9CA3AF" />
            </div>
          )}

          <p className={styles.uploadTitle}>
            {isUploading
              ? loadingMessage
              : formData.photoUrl
              ? "Imagen cargada correctamente" // Cambiado porque el File name se pierde al recargar borrador
              : "Subir foto de referencia"}
          </p>

          {!formData.photoUrl && !isUploading && (
            <p className={styles.uploadSubtitle}>
              Ayuda a identificar la pieza exacta
            </p>
          )}
        </div>

        <div className={styles.field} style={{ marginTop: "20px" }}>
          <label>Notas adicionales</label>
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
