"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";

import styles from "./RequestDetail.module.css";
import Button from "@/components/button/Button";
import { useAuth } from "@/context/AuthContext";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import { SkeletonRequestDetail } from "@/components/skeleton/SkeletonRequestDetail";
import {
  getProviderRequests,
  getRequestThread,
  ProviderQuoteRequest,
  RequestThreadData,
  ThreadQuestion,
} from "@/app/lib/api/provider/home/request";
import { QuestionsCard } from "@/components/questions-card/QuestionsCard";
import Header from "@/components/header/Header";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [request, setRequest] = useState<ProviderQuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const [threadData, setThreadData] = useState<RequestThreadData | null>(null);
  const [threadLoading, setThreadLoading] = useState(true);
  const [threadError, setThreadError] = useState(false);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getProviderRequests(jwt);
        if (res.ok) {
          const found = res.data.requests.find(
            (r) => r.documentId === params.id,
          );
          setRequest(found || null);
        }
      } catch (error) {
        console.error("Error cargando solicitud:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [jwt, params.id]);

  const fetchThread = useCallback(async (quoteRequestDocId: string) => {
    if (!jwt) return;
    try {
      setThreadLoading(true);
      setThreadError(false);
      const res = await getRequestThread(jwt, quoteRequestDocId);
      if (res.ok) setThreadData(res.data);
      else setThreadError(true);
    } catch {
      setThreadError(true);
    } finally {
      setThreadLoading(false);
    }
  }, [jwt]);

  useEffect(() => {
    if (request?.request.documentId) {
      fetchThread(request.request.documentId);
    }
  }, [request, fetchThread]);

  // Insert optimista de la pregunta creada + ajuste de contadores (total/pending).
  // La fuente de verdad sigue siendo el backend: se refetch en segundo plano.
  const handleQuestionCreated = useCallback(
    (question: ThreadQuestion) => {
      setThreadData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          questions: [question, ...prev.questions],
          thread: {
            ...prev.thread,
            total: prev.thread.total + 1,
            pending: prev.thread.pending + 1,
          },
        };
      });
      if (request?.request.documentId) {
        fetchThread(request.request.documentId);
      }
    },
    [request, fetchThread],
  );

  const handleNeedsRefetch = useCallback(() => {
    if (request?.request.documentId) {
      fetchThread(request.request.documentId);
    }
  }, [request, fetchThread]);

  if (loading) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <div className={styles.mainContainer}>
            <Header title="Detalle de Consulta" />
            <div className={styles.content}>
              <SkeletonRequestDetail />
            </div>
          </div>
        </div>
      </PageAnimation>
    );
  }

  if (!request) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.errorContainer}>
          <p>Consulta no encontrada</p>
          <Button onClick={() => router.push("/home/vendor")}>
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const vehicleInfo = `${request.request.vehicle.brand} ${request.request.vehicle.model} ${request.request.vehicle.year}`;
  const locationInfo = request.request.location;

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.mainContainer}>
          <Header title="Detalle de Solictud" />
          <div className={styles.content}>
            <section className={styles.headerSection}>
              <div className={styles.headerTop}>
                <div className={styles.idBadge}>
                  <IconsApp.Document />
                  <span>
                    Consulta {request.id.toString().padStart(5, "0")}
                  </span>
                </div>
                <span className={styles.statusBadge}>{request.status}</span>
              </div>
              <p className={styles.dateText}>
                Fecha:{" "}
                {new Date(request.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>
                Repuestos solicitados ({request.request.items.length})
              </h3>
              <div className={styles.itemsList}>
                {request.request.items.map((item, index) => (
                  <div key={index} className={styles.itemRow}>
                    <div className={styles.itemIcon}>
                      <IconsApp.Gear />
                    </div>
                    <div className={styles.itemInfo}>
                      <h4 className={styles.itemName}>{item.productName}</h4>
                      <p className={styles.itemDetail}>
                        Cantidad: {item.quantity}
                      </p>
                      <p className={styles.itemCondition}>
                        Condición preferida:{" "}
                        {item.conditionPreferred === "no_importa"
                          ? "Cualquiera"
                          : item.conditionPreferred}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Vehículo</h3>
              <div className={styles.vehicleInfo}>
                <div className={styles.iconCircle}>
                  <IconsApp.Car />
                </div>
                <div className={styles.vehicleDetails}>
                  <h4 className={styles.vehicleName}>{vehicleInfo}</h4>
                  <p className={styles.vehicleExtra}>
                    {request.request.vehicle.engine}
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Ubicación del cliente</h3>
              <div className={styles.locationInfo}>
                <div className={styles.locationRow}>
                  <IconsApp.Location />
                  <div>
                    <p className={styles.locationName}>{locationInfo.name}</p>
                    <p className={styles.locationParish}>
                      {locationInfo.parish}, {locationInfo.municipality},{" "}
                      {locationInfo.state}
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
                  <svg
                    width="13"
                    height="15"
                    viewBox="0 0 13 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="0.75" y="6.25" width="11.5" height="8.5" rx="1.25" stroke="#aaa" strokeWidth="1.5" />
                    <path d="M3.5 6V4.5a3 3 0 016 0V6" stroke="#aaa" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <p style={{ fontSize: 12, color: "#aaa", margin: 0 }}>
                    Dirección exacta disponible al generar la orden.
                  </p>
                </div>
              </div>
            </section>

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Cliente</h3>
              <div className={styles.vehicleInfo}>
                <div className={styles.iconCircle}>
                  <IconsApp.User />
                </div>
                <div className={styles.vehicleDetails}>
                  <h4 className={styles.vehicleName}>
                    @{request.request.client.username}
                  </h4>
                  <p className={styles.vehicleExtra}>Cliente verificado</p>
                </div>
              </div>
            </section>

            <QuestionsCard
              loading={threadLoading}
              error={threadError}
              threadData={threadData}
              onRetry={() => fetchThread(request.request.documentId)}
              items={request.request.items.map((item) => ({
                documentId: item.documentId,
                productName: item.productName,
              }))}
              requestDocId={request.request.documentId}
              jwt={jwt ?? ""}
              onQuestionCreated={handleQuestionCreated}
              onNeedsRefetch={handleNeedsRefetch}
            />

            {request.status === "pending" && (
              <div className={styles.actionsContainer}>
                <Button
                  className={styles.btnPrimary}
                  onClick={() =>
                    router.push(
                      `/home/vendor/quotes/send-quote?id=${params.id}`,
                    )
                  }
                >
                  Cotizar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}
