"use client";

import { useEffect } from "react";
import styles from "./ImageViewer.module.css";

interface ImageViewerProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

export function ImageViewer({ src, alt = "", onClose }: ImageViewerProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className={styles.backdrop} onClick={onClose} role="dialog" aria-modal="true">
      <img
        className={styles.image}
        src={src}
        alt={alt}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
