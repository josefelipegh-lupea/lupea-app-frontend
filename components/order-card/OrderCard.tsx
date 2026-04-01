"use client";

import React from "react";
import styles from "./OrderCard.module.css";
import { IconsApp } from "../icons/Icons";

interface OrderProps {
  id: string;
  documentId: string;
  title: string;
  cantidadRepuestos: number;
  status: "ACTIVA" | "COMPLETADA" | "CANCELADA" | "PAGO PENDIENTE";
  badge?: string;
  onViewOrder?: (documentId: string) => void;
}

export const OrderCard: React.FC<OrderProps> = ({
  id,
  documentId,
  title,
  cantidadRepuestos,
  status,
  badge,
  onViewOrder,
}) => {
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  const getStatusClass = () => {
    switch (status) {
      case "ACTIVA":
        return styles.activa;
      case "COMPLETADA":
        return styles.completada;
      case "CANCELADA":
        return styles.cancelada;
      case "PAGO PENDIENTE":
        return styles.pagoPendiente;
      default:
        return "";
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <div className={styles.mainInfo}>
          <div className={styles.textColumn}>
            <IconsApp.Document color="#A1A1A1" />

            <div className={styles.headerTitle}>
              <span className={styles.orderNumber}> Orden #{id.slice(-5)}</span>

              <span className={styles.title}>{title}</span>
              <h2 className={styles.repuestosCount}>
                {formatNumber(cantidadRepuestos)} Repuestos
              </h2>
            </div>
          </div>

          {badge && (
            <span className={`${styles.badge} ${getStatusClass()}`}>
              {badge}
            </span>
          )}
        </div>

        <div className={styles.divider}></div>

        <button
          className={styles.btnVerOrden}
          onClick={() => onViewOrder?.(documentId)}
        >
          Ver orden
        </button>
      </div>
    </div>
  );
};
