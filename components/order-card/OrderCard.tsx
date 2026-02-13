"use client";

import React, { useState, useRef, useEffect } from "react";
import styles from "./OrderCard.module.css";
import { IconsApp } from "../icons/Icons";

interface OrderProps {
  id: string;
  cantidadRepuestos: number;
  status: "ACTIVA" | "COMPLETADA" | "CANCELADA";
}

export const OrderCard: React.FC<OrderProps> = ({
  id,
  cantidadRepuestos,
  status,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleViewOrder = () => {
    cardRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.scrollTo({
      top: cardRef.current?.offsetTop ? cardRef.current.offsetTop - 100 : 0,
      behavior: "smooth",
    });

    // Aquí iría la lógica para navegar al detalle o expandir
    // setIsExpanded(!isExpanded);
  };

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.body}>
        <div className={styles.mainInfo}>
          <div className={styles.textColumn}>
            <IconsApp.Document color="#A1A1A1" />

            <div className={styles.headerTitle}>
              <span className={styles.orderNumber}> Orden #{id}</span>
              <h2 className={styles.repuestosCount}>
                {formatNumber(cantidadRepuestos)} Repuestos
              </h2>
            </div>
          </div>

          <div className={`${styles.badge} ${styles[status.toLowerCase()]}`}>
            {status}
          </div>
        </div>

        <div className={styles.divider}></div>

        <button className={styles.btnVerOrden} onClick={handleViewOrder}>
          Ver orden
        </button>
      </div>
    </div>
  );
};
