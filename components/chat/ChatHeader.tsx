"use client";

import { useEffect, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./ChatHeader.module.css";

export type OrderStatus =
  | "active"
  | "payment_validation"
  | "completed"
  | "cancelled"
  | string;

interface ChatHeaderProps {
  name: string;
  orderCode: string | null;
  orderStatus: OrderStatus | null;
  isOtherOnline: boolean;
  participantLeftAt: Date | null;
  lastMessageAt?: string | null;
  onBack: () => void;
}

const STATUS_LABEL: Record<string, string> = {
  active: "ACTIVA",
  payment_validation: "PAGO PENDIENTE",
  completed: "COMPLETADA",
  cancelled: "CANCELADA",
};

const STATUS_CLASS: Record<string, string> = {
  active: styles.badgeActive,
  payment_validation: styles.badgePending,
  completed: styles.badgeCompleted,
  cancelled: styles.badgeCancelled,
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function getRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Activo hace un momento";
  if (diffMin < 60) return `Activo hace ${diffMin} min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `Activo hace ${diffH} h`;
  return `Activo hace ${Math.floor(diffH / 24)} d`;
}

export default function ChatHeader({
  name,
  orderCode,
  orderStatus,
  isOtherOnline,
  participantLeftAt,
  lastMessageAt,
  onBack,
}: ChatHeaderProps) {
  // Refresh relative time every 30 s
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const statusLabel =
    orderStatus && STATUS_LABEL[orderStatus]
      ? STATUS_LABEL[orderStatus]
      : orderStatus?.toUpperCase() ?? null;

  const statusClass =
    orderStatus && STATUS_CLASS[orderStatus]
      ? STATUS_CLASS[orderStatus]
      : styles.badgeDefault;

  let subtitleText: string | null = null;
  if (isOtherOnline) {
    subtitleText = "En línea";
  } else if (participantLeftAt) {
    subtitleText = getRelativeTime(participantLeftAt);
  } else if (lastMessageAt) {
    subtitleText = getRelativeTime(new Date(lastMessageAt));
  }

  return (
    <div className={styles.header}>
      {/* Back arrow */}
      <button
        className={styles.backButton}
        onClick={onBack}
        aria-label="Volver"
        type="button"
      >
        <IconsApp.BackArrow color="#1a1a3d" />
      </button>

      {/* Avatar */}
      <div className={styles.avatar}>
        <span>{getInitials(name)}</span>
      </div>

      {/* Info — two lines */}
      <div className={styles.info}>
        {/* Line 1: name + order code */}
        <div className={styles.line1}>
          <span className={styles.name}>{name}</span>
          {orderCode && (
            <span className={styles.orderCode}>· {orderCode}</span>
          )}
        </div>
        {/* Line 2: online status + badge */}
        <div className={styles.line2}>
          {isOtherOnline && <span className={styles.onlineDot} />}
          {subtitleText && (
            <span className={styles.subtitle}>{subtitleText}</span>
          )}
          {statusLabel && (
            <span className={`${styles.badge} ${statusClass}`}>
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      {/* 3-dot menu (visual only) */}
      <button
        className={styles.menuButton}
        aria-label="Más opciones"
        type="button"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <circle cx="12" cy="5" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="12" cy="19" r="1.8" />
        </svg>
      </button>
    </div>
  );
}
