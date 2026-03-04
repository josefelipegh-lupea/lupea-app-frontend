"use client";

import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { FormData } from "@/app/(dashboard)/home/user/request/page";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import Image from "next/image"; // Importa el componente Image de Next.js
import {
  deleteQuoteItemImage,
  uploadQuoteItemImage,
} from "@/app/lib/api/request/request";

interface ExtraInfoStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  jwt: string; // Necesitamos el JWT para la subida
}

export default function ExtraInfoStep({
  formData,
  setFormData,
  jwt,
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

      // 1. Llamada al servicio que creamos
      const res = await uploadQuoteItemImage(jwt, file);

      // 2. Actualizamos el formData con la URL o ID que devuelve la API
      setFormData((prev) => ({
        ...prev,
        photo: file, // Guardamos el file para la UI
        photoUrl: res.data.image.url, // Guardamos la URL para el envío final
        photoId: res.data.image.id, // Guardamos el ID por si lo necesitas
      }));

      // 3. Toast de éxito de 10 segundos
      toast.success(res.message, { duration: 10000 });
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Error al subir imagen";
      toast.error(msg, { duration: 8000 });
    } finally {
      setIsUploading(false);
      // Limpiamos el input para poder subir la misma foto si se desea
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, extraInfo: e.target.value }));
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita que se dispare el click del input

    if (!formData.photoId || !jwt) return;

    try {
      setLoadingMessage("Eliminando imagen...");
      setIsUploading(true); // Reutilizamos el estado de carga para bloquear acciones

      // 1. Llamada a la API de eliminación
      const res = await deleteQuoteItemImage(jwt, formData.photoId);

      // 2. Limpiamos los campos relacionados en el FormData
      setFormData((prev) => ({
        ...prev,
        photo: null,
        photoUrl: undefined,
        photoId: undefined,
      }));

      // 3. Toast de éxito de 10 segundos
      toast.success(res.message, { duration: 10000 });
    } catch (error: unknown) {
      const msg =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la imagen";
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
        {/* Añadimos una clase de loading si está subiendo */}

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
            /* MINIATURA GRANDE */
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
            /* ICONO INICIAL */
            <div className={styles.uploadIconCircle}>
              <IconsApp.CameraPlus color="#9CA3AF" />
            </div>
          )}

          {/* TÍTULO: Se muestra siempre, pero cambia el texto */}
          <p className={styles.uploadTitle}>
            {isUploading
              ? loadingMessage
              : formData.photoUrl
              ? formData.photo?.name
              : "Subir foto de referencia"}
          </p>

          {/* SUBTÍTULO: Solo se muestra si NO hay foto y NO está subiendo */}
          {!formData.photoUrl && !isUploading && (
            <p className={styles.uploadSubtitle}>
              Ayuda a identificar la pieza exacta
            </p>
          )}
        </div>

        <div className={styles.field} style={{ marginTop: "20px" }}>
          <label>Nombre del repuesto</label>
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
