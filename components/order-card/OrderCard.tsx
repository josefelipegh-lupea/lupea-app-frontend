"use client";

import React from "react";
import styles from "./OrderCard.module.css";
import { IconsApp } from "../icons/Icons";

interface OrderProps {
  id: string;
  documentId: string;
  title: string;
  cantidadRepuestos: number;
  status: "ACTIVA" | "COMPLETADA" | "CANCELADA";
  onViewOrder?: (documentId: string) => void;
}

export const OrderCard: React.FC<OrderProps> = ({
  id,
  documentId,
  title,
  cantidadRepuestos,
  status,
  onViewOrder,
}) => {
  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

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
