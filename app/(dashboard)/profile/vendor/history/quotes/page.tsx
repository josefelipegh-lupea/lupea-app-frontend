"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  getProviderQuoteHistory,
  ProviderQuote,
} from "@/app/lib/api/provider/home/quote";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import Header from "@/components/header/Header";
import styles from "./QuoteHistory.module.css";

const STATUS_LABELS: Record<string, string> = {
  expired: "Vencida",
  rejected: "Rechazada",
  cancelled: "Cancelada",
  accepted: "Con orden",
};

const STATUS_BADGE: Record<string, string> = {
  expired: styles.badgeExpired,
  rejected: styles.badgeRejected,
  cancelled: styles.badgeCancelled,
  accepted: styles.badgeAccepted,
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitial = (name: string | null | undefined) =>
  (name ?? "?").charAt(0).toUpperCase();

export default function VendorHistoryQuotesPage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchHistory = useCallback(
    async (p: number) => {
      if (!jwt) return;
      try {
        setLoading(true);
        const res = await getProviderQuoteHistory(jwt, p, 20);
        if (res.ok) {
          setQuotes(res.data.quotes);
          setPageCount(res.data.pagination.pageCount);
          setTotal(res.data.pagination.total);
        }
      } catch (error) {
        console.error("Error loading quote history:", error);
      } finally {
        setLoading(false);
      }
    },
    [jwt],
  );

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  const renderBadge = (status: string) => (
    <span className={`${styles.badge} ${STATUS_BADGE[status] ?? styles.badgeRejected}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Historial de Cotizaciones" />
          <div className={styles.content}>
            <SkeletonOrders />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        <Header title="Historial de Cotizaciones" />
        <div className={styles.content}>
          {quotes.length === 0 ? (
            <p className={styles.emptyText}>
              No hay cotizaciones en el historial.
            </p>
          ) : (
            <>
              {quotes.map((quote) => {
                const clientName =
                  quote.request?.client?.username ??
                  (quote.request as any)?.user?.username ??
                  "Cliente";
                return (
                  <div key={quote.documentId} className={styles.quoteCard}>
                    {/* Header: código + badge */}
                    <div className={styles.quoteCardHeader}>
                      <div>
                        <p className={styles.quoteCode}>{quote.quoteCode}</p>
                        <p className={styles.quoteDate}>
                          {formatDate(quote.createdAt)}
                        </p>
                      </div>
                      {renderBadge(quote.status)}
                    </div>

                    {/* Cliente */}
                    <div className={styles.clientRow}>
                      <div className={styles.clientAvatar}>
                        {getInitial(clientName)}
                      </div>
                      <span className={styles.clientName}>{clientName}</span>
                    </div>

                    {/* Items */}
                    {quote.items && quote.items.length > 0 && (
                      <div className={styles.itemsList}>
                        {quote.items.map((item) => (
                          <div key={item.id} className={styles.itemRow}>
                            <span className={styles.itemName}>
                              {item.productName}
                            </span>
                            <span className={styles.itemPrice}>
                              ${item.subtotal?.toFixed(2) ?? "—"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Total */}
                    <div className={styles.totalRow}>
                      <span className={styles.totalLabel}>Total cotización</span>
                      <span className={styles.totalAmount}>
                        ${quote.priceTotal?.toFixed(2) ?? "—"}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Paginación */}
              {pageCount > 1 && (
                <div className={styles.paginationRow}>
                  <button
                    className={styles.paginationBtn}
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Anterior
                  </button>
                  <span className={styles.paginationInfo}>
                    {page} / {pageCount} ({total} total)
                  </span>
                  <button
                    className={styles.paginationBtn}
                    disabled={page >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
