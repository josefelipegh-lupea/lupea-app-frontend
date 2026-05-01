"use client";

import { useRef, useState, ChangeEvent } from "react";
import Image from "next/image";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./PaymentSheet.module.css";

interface PaymentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File, note?: string) => void;
  loading: boolean;
}

export default function PaymentSheet({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: PaymentSheetProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && selected.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreview(null);
    }
    e.target.value = "";
  }

  function handleConfirm() {
    if (!file || loading) return;
    onConfirm(file, note.trim() || undefined);
  }

  function handleClose() {
    if (loading) return;
    setFile(null);
    setPreview(null);
    setNote("");
    onClose();
  }

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div className={styles.handle} />

        <h2 className={styles.title}>Notificar pago</h2>
        <p className={styles.subtitle}>
          Adjunta el comprobante de pago para notificar al proveedor.
        </p>

        {/* File drop zone */}
        <button
          className={styles.dropZone}
          onClick={() => fileInputRef.current?.click()}
          type="button"
          disabled={loading}
        >
          {preview ? (
            <div className={styles.previewWrapper}>
              <Image
                src={preview}
                alt="Preview"
                width={200}
                height={150}
                className={styles.previewImage}
                unoptimized
              />
              <span className={styles.changeLabel}>Cambiar imagen</span>
            </div>
          ) : file ? (
            <div className={styles.fileInfo}>
              <span className={styles.dropIcon}>
                <IconsApp.Document color="#f08100" />
              </span>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.changeLabel}>Cambiar archivo</span>
            </div>
          ) : (
            <div className={styles.dropPlaceholder}>
              <span className={styles.dropIcon}>
                <IconsApp.Camera color="#f08100" />
              </span>
              <span className={styles.dropText}>
                Toca para subir el comprobante
              </span>
              <span className={styles.dropHint}>
                Imagen o PDF · Obligatorio
              </span>
            </div>
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf"
          className={styles.hiddenInput}
          onChange={handleFileChange}
        />

        {/* Note field */}
        <textarea
          className={styles.noteInput}
          placeholder="Nota (opcional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          disabled={loading}
        />

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.confirmButton}
            onClick={handleConfirm}
            disabled={!file || loading}
            type="button"
          >
            {loading ? "Enviando..." : "Confirmar pago"}
          </button>
          <button
            className={styles.cancelButton}
            onClick={handleClose}
            disabled={loading}
            type="button"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
