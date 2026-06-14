import React, { useState, useRef, useEffect } from "react";

import { IconsApp } from "../icons/Icons";
import { formatDeliveryTimeLabel } from "@/app/utils/formatDeliveryTimeLabel";
import { formatProviderReputation } from "@/app/utils/formatProviderReputation";

import styles from "./PriceCard.module.css";

interface Item {
  name: string;
  model: string;
  type: string;
  notes?: string | null;
}

interface PriceProps {
  id: string;
  date: string;
  workshop: string;
  rating?: number;
  reviewCount?: number;
  amount: string;
  time: string;
  items: Item[];
  totalSolicitados?: number;
  isProvider?: boolean;
  onViewQuote?: (documentId: string) => void;
  onCompare?: (documentId: string) => void;
  onViewOrder?: (documentId: string) => void;
  documentId?: string;
  hasOrders?: boolean;
  orderDocumentId?: string;
  quoteDocumentId?: string;
}

export const PriceCard: React.FC<PriceProps> = ({
  id,
  date,
  workshop,
  rating,
  reviewCount,
  amount,
  time,
  items,
  totalSolicitados = 7,
  isProvider = false,
  onViewQuote,
  onCompare,
  onViewOrder,
  documentId,
  hasOrders = false,
  orderDocumentId,
  quoteDocumentId,
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
  const providerReputation = formatProviderReputation(rating, reviewCount);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.header}>
        <span>Consulta {id}</span>
        <span>{date}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.tallerSection}>
          <div className={styles.tallerLeft}>
            <div className={styles.iconBox}>
              <IconsApp.Tool />
            </div>
            <span className={styles.tallerName}>{workshop}</span>
          </div>

          {providerReputation.hasRating ? (
            <div className={styles.reputation}>
              <IconsApp.Star />
              <span className={styles.ratingValue}>{providerReputation.label}</span>
            </div>
          ) : null}
        </div>

        <p className={styles.repuestosResumen}>
          {formatNumber(items.length)} de {formatNumber(totalSolicitados)}{" "}
          repuestos solicitados
        </p>

        <div className={styles.itemsContainer} style={{ maxHeight }}>
          <div ref={contentRef} className={styles.itemsList}>
            {items.map((item, index) => (
              <div key={index} className={styles.itemRow}>
                <div className={styles.settingsIcon}>
                  <IconsApp.Gear />
                </div>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <p className={styles.itemDetail}>
                    {item.model} • {item.type}
                  </p>
                  {item.notes && (
                    <p className={styles.itemNotes}>{item.notes}</p>
                  )}
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
            {formatDeliveryTimeLabel(time)}
          </div>
          <div className={styles.monto}>${amount}</div>
        </div>

        <div className={styles.actions}>
          {isProvider ? (
            <button
              className={styles.btnVer}
              onClick={() => documentId && onViewQuote?.(documentId)}
            >
              Ver detalle de cotización
            </button>
          ) : (
            <>
              {!hasOrders && (
                <button
                  className={styles.btnVer}
                  onClick={() => quoteDocumentId && onViewQuote?.(quoteDocumentId)}
                >
                  Ver Oferta
                </button>
              )}
              <button
                className={hasOrders ? styles.btnVerOrden : styles.btnComparar}
                onClick={() => {
                  if (hasOrders) {
                    onViewOrder?.(quoteDocumentId || documentId!);
                  } else if (documentId) {
                    onCompare?.(documentId);
                  }
                }}
              >
                {hasOrders ? "Ver Orden" : "Comparar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
