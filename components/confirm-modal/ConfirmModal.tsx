import React from "react";
import { createPortal } from "react-dom";
import styles from "./ConfirmModal.module.css";
import { IconsApp } from "../icons/Icons";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning";
}

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === "undefined" || !document.body) return null;
  return createPortal(children, document.body);
};

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "¿Estás seguro?",
  description = "Esta acción no se puede deshacer.",
  confirmText = "Sí, eliminar",
  cancelText = "No, mantener",
  variant = "danger",
}) => {
  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.floatingCard}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.iconContainer}>
            <IconsApp.Trash color="#ef4444" />
          </div>

          <h3>{title}</h3>
          <p>{description}</p>

          <div className={styles.actions}>
            <button
              className={`${styles.confirmBtn} ${styles[variant]}`}
              onClick={() => {
                onConfirm();
                onClose();
              }}
            >
              {confirmText}
            </button>
            <button className={styles.cancelBtn} onClick={onClose}>
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};
