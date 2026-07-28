"use client";

import LupitaAvatar from "./LupitaAvatar";
import styles from "./LupitaTrigger.module.css";

interface LupitaTriggerProps {
  onOpen: () => void;
  onManualRequest: () => void;
}

export default function LupitaTrigger({
  onOpen,
  onManualRequest,
}: LupitaTriggerProps) {
  return (
    <div>
      <button
        type="button"
        className={styles.trigger}
        onClick={onOpen}
        aria-label="Abrir chat con Lupita"
      >
        <LupitaAvatar size={44} />
        <span className={styles.triggerText}>
          <span className={styles.triggerName}>Lupita</span>
          <span className={styles.triggerPlaceholder}>
            Cuéntame qué necesitas...
          </span>
        </span>
        <span className={styles.triggerArrow} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2 8H14M14 8L8.5 2.5M14 8L8.5 13.5"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <button
        type="button"
        className={styles.manualLink}
        onClick={onManualRequest}
      >
        o créala tú mismo
      </button>
    </div>
  );
}
