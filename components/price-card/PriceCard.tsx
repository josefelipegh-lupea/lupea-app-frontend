import React, { useState, useRef, useEffect } from "react";

import { IconsApp } from "../icons/Icons";

import styles from "./PriceCard.module.css";

interface Item {
  nombre: string;
  modelo: string;
  tipo: string;
}

interface PriceProps {
  id: string;
  fecha: string;
  taller: string;
  monto: string;
  tiempo: string;
  items: Item[];
  totalSolicitados?: number;
}

export const PriceCard: React.FC<PriceProps> = ({
  id,
  fecha,
  taller,
  monto,
  tiempo,
  items,
  totalSolicitados = 7,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState("0px");
  const [collapsedHeight, setCollapsedHeight] = useState("0px");
  const cardRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    if (!isExpanded) {
      cardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    setIsExpanded(!isExpanded);
    window.scrollTo({
      top: cardRef.current?.offsetTop ? cardRef.current.offsetTop - 100 : 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      const rows = el.querySelectorAll(`.${styles.itemRow}`);
      if (rows.length === 0) return;

      const first = rows[0] as HTMLElement;
      const second = rows[1] as HTMLElement | undefined;

      const h1 = first.offsetHeight;
      const h2 = second ? second.offsetHeight : 0;
      const gap = 12;

      const base = h1 + (second ? h2 + gap : 0);
      const colHeight = `${base}px`;

      setCollapsedHeight(colHeight);
      if (!isExpanded) {
        setMaxHeight(colHeight);
      }
    });
  }, [items, isExpanded]);

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    if (isExpanded) {
      const full = el.scrollHeight;
      setMaxHeight(`${full}px`);
    } else {
      setMaxHeight(collapsedHeight);
    }
  }, [isExpanded, collapsedHeight]);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.header}>
        <span>Solicitud {id}</span>
        <span>{fecha}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.tallerSection}>
          <div className={styles.iconBox}>
            <IconsApp.Tool />
          </div>
          <span className={styles.tallerName}>{taller}</span>
        </div>

        <p className={styles.repuestosResumen}>
          {formatNumber(items.length)} de {formatNumber(totalSolicitados)}{" "}
          Repuestos solicitados
        </p>

        <div className={styles.itemsContainer} style={{ maxHeight }}>
          <div ref={contentRef} className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.settingsIcon}>
                  <IconsApp.Gear />
                </div>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.nombre}</h4>
                  <p className={styles.itemDetail}>
                    {item.modelo} • {item.tipo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {items.length > 2 && (
          <button className={styles.verTodosBtn} onClick={toggleExpand}>
            {isExpanded ? "Ver menos" : `Ver todos (${items.length})`}
            <span className={isExpanded ? styles.iconRotate : ""}>
              <IconsApp.DownArrow />
            </span>
          </button>
        )}

        <div className={styles.footer}>
          <div className={styles.tiempo}>
            <span className={styles.clockIcon}>
              <IconsApp.GreenClock />
            </span>
            {tiempo}
          </div>
          <div className={styles.monto}>${monto}</div>
        </div>

        <div className={styles.actions}>
          <button className={styles.btnVer}>Ver oferta</button>
          <button className={styles.btnComparar}>Comparar</button>
        </div>
      </div>
    </div>
  );
};
