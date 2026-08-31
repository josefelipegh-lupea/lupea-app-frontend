"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import styles from "./RequestDetail.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  getClientRequestQuotes,
  ClientQuoteResponse,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import { PreQuoteQuestions } from "@/components/pre-quote-questions/PreQuoteQuestions";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import { IconsApp } from "@/components/icons/Icons";

const RequestDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [loading, setLoading] = useState(true);
  const [detailData, setDetailData] = useState<ClientQuoteResponse["data"] | null>(null);

  const requestId = params.id as string;

  useEffect(() => {
    const fetchDetail = async () => {
      if (!jwt || !requestId) return;
      try {
        setLoading(true);
        const res = await getClientRequestQuotes(jwt, requestId);
        if (res.ok) {
          setDetailData(res.data);
        }
      } catch (error) {
        console.error("Error loading request detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [jwt, requestId]);

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Detalle de Solicitud" />
          <div className={styles.container}>
            <SkeletonComparison />
          </div>
        </main>
      </div>
    );
  }

  const request = detailData?.request;
  const quotes: ClientQuote[] = detailData?.quotes ?? [];
  const summary = detailData?.summary;

  const formatCondition = (cond: string) => {
    if (cond === "no_importa") return "Cualquiera";
    if (cond === "original") return "Original";
    if (cond === "alternativo") return "Alternativo";
    return cond;
  };

  const requestNumericId = request?.id?.toString().padStart(5, "0") ?? "-----";
  const requestDate = request?.createdAt
    ? new Date(request.createdAt).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  const quoteCount = quotes.length;

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        <Header title="Detalle de Solicitud" />

        <div className={styles.container}>
          {/* Identifier row */}
          {request && (
            <div className={styles.identifierRow}>
              <span className={styles.consultaPill}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5 }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                Consulta {requestNumericId}
              </span>
              <span className={styles.requestDate}>Fecha: {requestDate}</span>
            </div>
          )}

          {/* Card: Repuestos solicitados */}
          {request && (
            <div className={styles.sectionCard}>
              <h3 className={styles.sectionTitle}>
                Repuestos solicitados ({request.items.length})
              </h3>

              <ul className={styles.itemsList}>
                {request.items.map((item) => (
                  <li key={item.id} className={styles.itemRow}>
                    <div className={styles.itemIconBox}>
                      <IconsApp.Gear />
                    </div>
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.productName}</p>
                      <p className={styles.itemMeta}>
                        Cantidad: {item.quantity} · {formatCondition(item.conditionPreferred)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className={styles.vehicleRow}>
                <div className={styles.vehicleIconBox}>
                  <IconsApp.Vehicle />
                </div>
                <span className={styles.vehicleText}>
                  {request.vehicle.brand} {request.vehicle.model} {request.vehicle.year}
                  {request.vehicle.engine
                    ? ` · Motor ${request.vehicle.engine.replace(/^motor\s+/i, "")}`
                    : ""}
                </span>
              </div>
            </div>
          )}

          {/* Card: Preguntas de proveedores (ABOVE cotizaciones) */}
          <PreQuoteQuestions requestDocumentId={requestId} />

          {/* Card: Cotizaciones */}
          <div className={styles.sectionCard}>
            <div className={styles.cotizacionesHeader}>
              <div className={styles.cotizacionesIconBox}>
                <IconsApp.Document color="#F08400" />
              </div>
              <h3 className={styles.sectionTitle} style={{ margin: 0, flex: 1 }}>Cotizaciones</h3>
              <span className={styles.quoteCount}>{quoteCount} recibidas</span>
            </div>

            {quotes.length > 0 ? (
              <>
                <ul className={styles.quoteList}>
                  {quotes.map((q) => (
                    <li key={q.documentId} className={styles.quoteRow}>
                      <div className={styles.quoteProviderAvatar}>
                        {q.provider.businessName.charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.quoteProviderInfo}>
                        <p className={styles.quoteProviderName}>{q.provider.businessName}</p>
                        <p className={styles.quoteProviderMeta}>
                          {q.provider.location?.municipality ?? q.provider.location?.state ?? ""} · {q.deliveryTime}
                        </p>
                      </div>
                      <span className={styles.quotePrice}>${q.priceTotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={styles.compareBtn}
                  onClick={() => router.push(`/home/user/request/${requestId}/quotes`)}
                >
                  Comparar cotizaciones
                </button>
              </>
            ) : (
              <>
                <p className={styles.noQuotesText}>Aún no hay cotizaciones disponibles.</p>
                <button
                  className={styles.compareBtn}
                  onClick={() => router.push(`/home/user/request/${requestId}/quotes`)}
                >
                  Ver ofertas disponibles
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RequestDetailPage;
