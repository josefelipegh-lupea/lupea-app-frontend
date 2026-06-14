"use client";

import { useEffect, useMemo, useState } from "react";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import StarRating from "@/components/star-rating/StarRating";

import { RequestCard } from "@/components/request-card/RequestCard";
import { PriceCard } from "@/components/price-card/PriceCard";
import { OrderCard } from "@/components/order-card/OrderCard";
import Button from "@/components/button/Button";
import { useRouter } from "next/navigation";
import { getMyRequests, QuoteRequest } from "@/app/lib/api/client/home/request";
import {
  getClientRequestQuotes,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import { getClientProfile } from "@/app/lib/api/client/clientProfile";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getMyClientOrders,
  getQuoteOrder,
  OrderData,
} from "@/app/lib/api/client/home/order";
import { formatConditionPreferred } from "@/app/utils/formatConditionPreferred";
import styles from "./Home.module.css";

interface FeaturedQuoteData {
  request: QuoteRequest;
  featuredQuote: ClientQuote;
}

interface RequestWithQuote {
  request: QuoteRequest;
  status: string;
  quoteDocumentId: string;
}

interface ClientHomeMetrics {
  requestsCount: number;
  quotesReceivedCount: number;
  ordersCount: number;
  averageRating: number;
  reviewCount: number;
  requestHistory: RequestHistoryEntry[];
  quoteHistory: RequestHistoryEntry[];
}

interface RequestHistoryEntry {
  month: string;
  count: number;
}

const formatMetricMonthLabel = (month: string) => {
  const [year, monthNumber] = month.split("-");
  const parsedYear = Number(year);
  const parsedMonth = Number(monthNumber) - 1;

  if (
    !Number.isInteger(parsedYear) ||
    !Number.isInteger(parsedMonth) ||
    parsedMonth < 0 ||
    parsedMonth > 11
  ) {
    return month;
  }

  return new Date(Date.UTC(parsedYear, parsedMonth, 1)).toLocaleDateString(
    "es-ES",
    { month: "short", timeZone: "UTC" },
  );
};

export default function HomePage() {
  const { jwt, profile, loginProfile, refreshLoginProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const { onNotification, notifications } = useSocket();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("COTIZACIONES");

  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [featuredQuotes, setFeaturedQuotes] = useState<FeaturedQuoteData[]>([]);
  const [requestsWithQuotes, setRequestsWithQuotes] = useState<
    RequestWithQuote[]
  >([]);
  const [orders, setOrders] = useState<OrderData[]>([]); 
  const [metrics, setMetrics] = useState<ClientHomeMetrics>({
    requestsCount: 0,
    quotesReceivedCount: 0,
    ordersCount: 0,
    averageRating: 0,
    reviewCount: 0,
    requestHistory: [],
    quoteHistory: [],
  });
  const [hasLoadedMetrics, setHasLoadedMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(false);
  const [loading, setLoading] = useState(true);

  const newQuotesCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.type === "client.quote_received" && !notification.read,
      ).length,
    [notifications],
  );

  const tokensAvailable = loginProfile?.tokensAvailable ?? 0;
  const tokensTotal = loginProfile?.tokensTotal ?? 0;
  const tokensPercentage = loginProfile?.monthlyConsumption?.percentage ?? 0;
  const tokensNextRenewal = loginProfile?.tokensNextRenewal
    ? new Date(loginProfile.tokensNextRenewal).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : loginProfile?.tokensLastRenewal
      ? new Date(loginProfile.tokensLastRenewal).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  const applyClientMetrics = (profileRes: Awaited<ReturnType<typeof getClientProfile>>) => {
    setMetrics({
      requestsCount: profileRes.metrics?.requestsCount ?? 0,
      quotesReceivedCount: profileRes.metrics?.quotesReceivedCount ?? 0,
      ordersCount: profileRes.metrics?.ordersCount ?? 0,
      averageRating: profileRes.reputation?.averageRating ?? 0,
      reviewCount: profileRes.reputation?.reviewCount ?? 0,
      requestHistory: profileRes.metrics?.requestHistory ?? [],
      quoteHistory: profileRes.metrics?.quoteHistory ?? [],
    });
    setHasLoadedMetrics(true);
    setMetricsError(false);
  };

  const loadClientMetrics = async (jwt: string) => {
    try {
      const profileRes = await getClientProfile(jwt);
      applyClientMetrics(profileRes);
      await refreshLoginProfile(profileRes);
    } catch (error) {
      setMetricsError(true);
      console.error("Error loading client metrics:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        await loadClientMetrics(jwt);

        const res = await getMyRequests(jwt);
        if (res.ok) {
          setRequests(res.data.requests);

          const requestsWithQuotesList = res.data.requests.filter(
            (r) => r.quotesReceived > 0,
          );

          const featuredData = await Promise.all(
            requestsWithQuotesList.slice(0, 3).map(async (request) => {
              const quotesRes = await getClientRequestQuotes(
                jwt,
                request.documentId,
              );
              if (quotesRes.ok && quotesRes.data.featuredQuote) {
                return {
                  request,
                  featuredQuote: quotesRes.data.featuredQuote,
                };
              }
              return null;
            }),
          );

          setFeaturedQuotes(
            featuredData.filter((d) => d !== null) as FeaturedQuoteData[],
          );

          const requestsQuotesData = await Promise.all(
            requestsWithQuotesList.slice(0, 3).map(async (request) => {
              const quotesRes = await getClientRequestQuotes(
                jwt,
                request.documentId,
              );
              if (quotesRes.ok && quotesRes.data.featuredQuote) {
                return {
                  request,
                  status: quotesRes.data.featuredQuote.request.status,
                  quoteDocumentId: quotesRes.data.featuredQuote.documentId,
                };
              }
              return null;
            }),
          );

          setRequestsWithQuotes(
            requestsQuotesData.filter((d) => d !== null) as RequestWithQuote[],
          );
        }

        const ordersRes = await getMyClientOrders(jwt);
        if (ordersRes.ok) {
          setOrders(ordersRes.data.orders);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwt, refreshLoginProfile]);

  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      if (
        notification.type === "client.quote_received" ||
        notification.type === "client.order_completed"
      ) {
        const fetchData = async () => {
          if (!jwt) return;
          try {
            const [requestsRes, ordersRes] = await Promise.all([
              getMyRequests(jwt, "sent"),
              getMyClientOrders(jwt),
            ]);
            if (requestsRes.ok) {
              setRequests(requestsRes.data.requests);

              const requestsWithQuotes = requestsRes.data.requests.filter(
                (r) => r.quotesReceived > 0,
              );

              const featuredData = await Promise.all(
                requestsWithQuotes.slice(0, 3).map(async (request) => {
                  const quotesRes = await getClientRequestQuotes(
                    jwt,
                    request.documentId,
                  );
                  if (quotesRes.ok && quotesRes.data.featuredQuote) {
                    return {
                      request,
                      featuredQuote: quotesRes.data.featuredQuote,
                    };
                  }
                  return null;
                }),
              );

              setFeaturedQuotes(
                featuredData.filter((d) => d !== null) as FeaturedQuoteData[],
              );
            }
            if (ordersRes.ok) {
              setOrders(ordersRes.data.orders);
            }
            await loadClientMetrics(jwt);
          } catch (error) {
            console.error("Error refreshing data:", error);
          }
        };
        fetchData();
      }
    });

    return unsubscribe;
  }, [jwt, onNotification, refreshLoginProfile]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "COTIZACIONES":
        if (loading)
          return <p className={styles.loadingText}>Cargando cotizaciones...</p>;
        if (featuredQuotes.length === 0)
          return (
            <p className={styles.emptyText}>No tienes cotizaciones todavía.</p>
          );

        return featuredQuotes
          .filter((data) => data.featuredQuote.request.status !== "ordered")
          .slice(0, 3).map((data) => {
          const quoteCodeShort = data.featuredQuote.quoteCode
            .split("-")
            .slice(2)
            .join("-");
          const hasOrders = data.featuredQuote.request.status === "ordered";
          return (
            <PriceCard
              key={data.featuredQuote.documentId}
              id={quoteCodeShort}
              date={new Date(data.featuredQuote.createdAt).toLocaleDateString(
                "es-ES",
              )}
              workshop={data.featuredQuote.provider.businessName}
              amount={data.featuredQuote.priceTotal.toFixed(2)}
              time={data.featuredQuote.deliveryTime}
              rating={data.featuredQuote.provider.rating}
              reviewCount={data.featuredQuote.provider.reviewCount}
              items={data.featuredQuote.items.map((item) => ({
                 name: item.productName,
                 model: `${data.request.vehicle.brand} ${data.request.vehicle.model} ${data.request.vehicle.year}`,
                 type: item.offeredBrand || formatConditionPreferred(item.requestItem?.conditionPreferred),
                 notes: item.notes || null,
               }))}
              totalSolicitados={data.request.items.length}
              documentId={data.request.documentId}
              quoteDocumentId={data.featuredQuote.documentId}
              hasOrders={hasOrders}
              onViewQuote={(docId) => router.push(`/home/user/quotes/${docId}`)}
              onCompare={(docId) =>
                router.push(`/home/user/request/${docId}/comparison`)
              }
              onViewOrder={async (quoteDocId) => {
                if (!jwt || !quoteDocId) return;
                try {
                  const res = await getQuoteOrder(jwt, quoteDocId);
                  if (res.ok && res.data.order) {
                    router.push(
                      `/home/user/orders/${res.data.order.documentId}`,
                    );
                  }
                } catch (error) {
                  console.error("Error fetching order:", error);
                }
              }}
            />
          );
        });

      case "SOLICITUDES":
        if (loading)
          return <p className={styles.loadingText}>Cargando solicitudes...</p>;
        if (requests.length === 0)
          return (
            <p className={styles.emptyText}>No tienes solicitudes activas.</p>
          );

        return requests.slice(0, 3).map((req) => {
          const quoteData = requestsWithQuotes.find(
            (r) => r.request.documentId === req.documentId,
          );
          const status = quoteData?.status;
          const quoteDocId = quoteData?.quoteDocumentId;
          return (
            <RequestCard
              key={req.documentId}
              id={req.id.toString().padStart(5, "0")}
              date={new Date(req.createdAt).toLocaleDateString("es-ES")}
              items={req.items.map((item) => ({
                name: item.productName,
                model: `${req.vehicle.brand} ${req.vehicle.model}`,
                type:
                  item.conditionPreferred === "no_importa"
                    ? "Cualquiera"
                    : item.conditionPreferred,
              }))}
              documentId={req.documentId}
              matchingSummary={req.matchingSummary}
              status={status}
              onViewOffers={(docId) =>
                router.push(`/home/user/request/${docId}/quotes`)
              }
              onViewQuote={() => router.push(`/home/user/quotes/${quoteDocId}`)}
            />
          );
        });

      case "ÓRDENES":
        if (loading)
          return <p className={styles.loadingText}>Cargando órdenes...</p>;
        {
          const activeOrders = orders.filter(
            (o) => o.status !== "completed" && o.status !== "cancelled"
          );
          if (activeOrders.length === 0)
            return <p className={styles.emptyText}>No tienes órdenes activas.</p>;
          return activeOrders
            .slice(0, 3)
            .map((o) => (
            <OrderCard
              key={o.documentId}
              id={o.documentId}
              documentId={o.documentId}
              title={o.provider.businessName}
              cantidadRepuestos={o.items.length}
              status={
                (o.status === "active"
                  ? "ACTIVA"
                  : o.status === "payment_validation"
                    ? "PAGO PENDIENTE"
                    : o.status === "cancelled"
                      ? "CANCELADA"
                      : "COMPLETADA") as
                  | "ACTIVA"
                  | "CANCELADA"
                  | "COMPLETADA"
                  | "PAGO PENDIENTE"
              }
              badge={
                o.status === "active"
                  ? "Activa"
                  : o.status === "payment_validation"
                    ? "Pago Pendiente"
                    : o.status === "cancelled"
                      ? "Cancelada"
                      : "Completada"
              }
              onViewOrder={(docId) => router.push(`/home/user/orders/${docId}`)}
            />
          ));
        }
      default:
        return null;
    }
  };

  const showMetricsFallback = metricsError && !hasLoadedMetrics;
  const requestHistoryMaxCount = Math.max(
    ...metrics.requestHistory.map((entry) => entry.count),
    1,
  );
  const emptyHistoryEntries: RequestHistoryEntry[] = [
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
  ];
  const requestHistoryEntries: RequestHistoryEntry[] =
    metrics.requestHistory.length > 0 ? metrics.requestHistory : emptyHistoryEntries;
  const quoteHistoryEntries: RequestHistoryEntry[] =
    metrics.quoteHistory.length > 0 ? metrics.quoteHistory : emptyHistoryEntries;
  const quoteHistoryMaxCount = Math.max(
    ...metrics.quoteHistory.map((entry) => entry.count),
    1,
  );

  const renderMetricChart = (
    entries: RequestHistoryEntry[],
    maxCount: number,
    variant: "purple" | "blue",
  ) => {
    if (showMetricsFallback) {
      return <div className={styles.metricChartEmpty}>--</div>;
    }

    return entries.map((entry, index) => {
      const heightPercent = (entry.count / maxCount) * 100;

      return (
        <div key={`${variant}-${entry.month}-${index}`} className={styles.metricBarGroup}>
          <span className={styles.metricBarValue}>{entry.count}</span>
          <div className={styles.metricBarTrack}>
            <div
              className={`${styles.metricBarFill} ${
                variant === "blue" ? styles.metricBarFillBlue : ""
              }`}
              style={{ height: `${Math.max(heightPercent, entry.count > 0 ? 18 : 0)}%` }}
            />
          </div>
          <span className={styles.metricBarLabel}>
            {entry.month ? formatMetricMonthLabel(entry.month) : "-"}
          </span>
        </div>
      );
    });
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        {/* PROFILE INCOMPLETE ALERT */}
        {profile?.status === "incomplete" && (
          <div className={styles.profileIncompleteAlert}>
            <div className={styles.icon}>
              <IconsApp.Warning color="#d97706" width="20" height="20" />
            </div>
            <div className={styles.content}>
              <p className={styles.title}>Perfil incompleto</p>
              <p className={styles.description}>
                Para crear solicitudes debes completar tu perfil personal.
              </p>
              <button
                type="button"
                className={styles.link}
                onClick={() => router.push("/profile/user/personal-info")}
              >
                Completar perfil
              </button>
            </div>
          </div>
        )}

        {/* 1. CARD DE LUPAS */}
        <div className={styles.leftSection}>
          <section className={styles.summaryCard}>
            <p className={styles.summaryLabel}>MIS LUPAS DISPONIBLES</p>
            <h2 className={styles.summaryValue}>
              {tokensAvailable.toLocaleString()}
            </h2>
            <p className={styles.summaryTotal}>
              de {tokensTotal.toLocaleString()} totales
            </p>

            <div className={styles.progressHeader}>
              <span>Consumo del mes</span>
              <span className={styles.percentaje}>
                {tokensPercentage.toFixed(2)}%
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${Math.min(tokensPercentage, 100)}%` }}
              ></div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.renovacionRow}>
              <span className={styles.renovacionLabel}>Renovación mensual</span>
              <span className={styles.dateText}>{tokensNextRenewal}</span>
            </div>
          </section>

          {/* BOTÓN NUEVA SOLICITUD */}
          <Button
            className={styles.btnNuevaSolicitud}
            onClick={() => {
              router.push("/home/user/request");
            }}
          >
            <span className={styles.plusIcon}>
              <IconsApp.Plus />
            </span>{" "}
            Nueva solicitud
          </Button>

          {/* 3. MÉTRICAS */}
          <section className={styles.metricsContainer}>
            <h3 className={styles.title}>Mis Métricas</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCardPurple}>
                <div className={styles.metricChartArea}>
                  {renderMetricChart(
                    requestHistoryEntries,
                    requestHistoryMaxCount,
                    "purple",
                  )}
                </div>
                <h4 className={styles.metricBigNum}>
                  {showMetricsFallback ? "--" : metrics.requestsCount}
                </h4>
                <p className={styles.metricSmallText}>Consultas realizadas</p>
              </div>

              <div className={styles.metricCardBlue}>
                <div className={styles.metricChartArea}>
                  {renderMetricChart(
                    quoteHistoryEntries,
                    quoteHistoryMaxCount,
                    "blue",
                  )}
                </div>
                <h4 className={styles.metricBigNum}>
                  {showMetricsFallback ? "--" : metrics.quotesReceivedCount}
                </h4>
                <p className={styles.metricSmallText}>Cotizaciones recibidas</p>
              </div>

              <div className={styles.metricCardGreen}>
                <div className={styles.metricIconWrap}>
                  <IconsApp.Chart />
                </div>
                <h4 className={styles.metricBigNum}>
                  {showMetricsFallback ? "--" : metrics.ordersCount}
                </h4>
                <p className={styles.metricSmallText}>Compras realizadas</p>
              </div>

              <div className={styles.metricCardOrange}>
                <div className={styles.stars}>
                  <StarRating rating={showMetricsFallback ? 0 : metrics.averageRating} />
                </div>
                <h4 className={styles.smallNum}>
                  {showMetricsFallback ? "--" : metrics.averageRating.toFixed(1)}
                </h4>
                <p className={styles.metricSmallText}>Tu reputación</p>
                <p className={styles.metricMetaText}>
                  {showMetricsFallback
                    ? "No se pudieron cargar"
                    : `${metrics.reviewCount} calificacion${metrics.reviewCount === 1 ? "" : "es"}`}
                </p>
              </div>
            </div>
          </section>
        </div>
        {/* 2. OFERTAS RECIENTES */}
        <div className={styles.rightSection}>
          <section className={styles.ofertasContainer}>
            <nav className={styles.tabs}>
              {["COTIZACIONES", "SOLICITUDES", "ÓRDENES"].map((tab) => (
                <button
                  key={tab}
                  className={
                    activeTab === tab ? styles.tabActive : styles.tabInactive
                  }
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className={styles.sectionHeader}>
              <h3 className={styles.title}>
                {activeTab === "COTIZACIONES"
                  ? "Ofertas Recientes"
                  : activeTab === "SOLICITUDES"
                    ? "Mis solicitudes"
                    : "Órdenes generadas"}
              </h3>
              {activeTab === "COTIZACIONES" && newQuotesCount > 0 && (
                <span className={styles.badgeNuevas}>
                  {newQuotesCount} Nuevas
                </span>
              )}
            </div>

            {renderTabContent()}

            <button
              className={styles.btnVerTodas}
              onClick={() => {
                if (activeTab === "COTIZACIONES") {
                  router.push("/home/user/quotes");
                } else if (activeTab === "SOLICITUDES") {
                  router.push("/home/user/allRequests");
                } else {
                  router.push("/home/user/orders");
                }
              }}
            >
              Ver todas{" "}
              <span className={styles.arrowIcon}>
                <IconsApp.RightArrow height="12" width="7" />
              </span>
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
