"use client";

import React, { useState, useRef, useEffect } from "react";
import { IconsApp } from "../icons/Icons";

import styles from "./RequestCard.module.css";

interface MatchingSummary {
  total: number;
  pending: number;
  viewed: number;
  quoted: number;
  rejected: number;
}

interface Item {
  name: string;
  model: string;
  type: string;
}

interface RequestProps {
  id: string;
  date: string;
  items: Item[];
  documentId?: string;
  onViewOffers?: (documentId: string) => void;
  onViewQuote?: (documentId: string) => void;
  isProvider?: boolean;
  matchingSummary?: MatchingSummary;
  status?: string;
}

export const RequestCard: React.FC<RequestProps> = ({
  id,
  date,
  items,
  documentId,
  onViewOffers,
  onViewQuote,
  isProvider = false,
  matchingSummary,
  status,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState("0px");
  const [collapsedHeight, setCollapsedHeight] = useState("0px");

  const contentRef = useRef<HTMLDivElement>(null);
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
      setMaxHeight(`${el.scrollHeight}px`);
    } else {
      setMaxHeight(collapsedHeight);
    }
  }, [isExpanded, collapsedHeight]);

  const formatNumber = (num: number) => (num < 10 ? `0${num}` : num);

  return (
    <div ref={cardRef} className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <IconsApp.Document />
          <span>Solicitud {id}</span>
        </div>
        <span className={styles.headerDate}>{date}</span>
      </div>

      <div className={styles.body}>
        <p className={styles.repuestosResumen}>
          {formatNumber(items.length)} repuestos solicitados
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

       

        <div className={styles.actionsSingle}>
          <button
            className={styles.btnVerOfertas}
            onClick={() => {
              if (status === "ordered" && onViewQuote) {
                documentId && onViewQuote(documentId);
              } else if (onViewOffers) {
                documentId && onViewOffers(documentId);
              }
            }}
            disabled={!isProvider && matchingSummary?.total === 0}
          >
            {isProvider
              ? "Ver detalles de solicitud"
              : status === "ordered"
              ? "Ver cotización"
              : matchingSummary?.total === 0
              ? "Sin ofertas aún"
              : "Ver ofertas disponibles"}
          </button>
        </div>
      </div>
    </div>
  );
};
