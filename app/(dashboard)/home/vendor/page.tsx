"use client";

import { useEffect, useMemo, useState } from "react";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import StarRating from "@/components/star-rating/StarRating";

import styles from "./Home.module.css";
import { RequestCard } from "@/components/request-card/RequestCard";
import { PriceCard } from "@/components/price-card/PriceCard";
import { OrderCard } from "@/components/order-card/OrderCard";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import {
  getProviderRequests,
  ProviderQuoteRequest,
} from "@/app/lib/api/provider/home/request";
import {
  getProviderQuotes,
  ProviderQuote,
} from "@/app/lib/api/provider/home/quote";
import {
  getProviderOrders,
  ProviderOrderData,
} from "@/app/lib/api/provider/home/order";

interface RequestHistoryEntry {
  month: string;
  count: number;
}

interface ProviderHomeMetrics {
  requestsReceivedCount: number;
  quotesSentCount: number;
  quotesAcceptedCount: number;
  averageRating: number;
  reviewCount: number;
  requestHistory: RequestHistoryEntry[];
  quoteSentHistory: RequestHistoryEntry[];
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
  const { jwt, loginProfile, refreshLoginProfile, refreshProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const { onNotification, notifications, onProviderStatusChanged } = useSocket();
  const [activeTab, setActiveTab] = useState("SOLICITUDES");

  const [requests, setRequests] = useState<ProviderQuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [orders, setOrders] = useState<ProviderOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [metrics, setMetrics] = useState<ProviderHomeMetrics>({
    requestsReceivedCount: 0,
    quotesSentCount: 0,
    quotesAcceptedCount: 0,
    averageRating: 0,
    reviewCount: 0,
    requestHistory: [],
    quoteSentHistory: [],
  });
  const [hasLoadedMetrics, setHasLoadedMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState(false);

  const newRequestsCount = useMemo(
    () =>
      notifications.filter(
        (notification) =>
          notification.type === "provider.request_assigned" &&
          !notification.read,
      ).length,
    [notifications],
  );

  const tokensAvailable = loginProfile?.tokensAvailable ?? 0;

  const applyProviderMetrics = (profileRes: any) => {
    setMetrics({
      requestsReceivedCount: profileRes.metrics?.requestsReceivedCount ?? 0,
      quotesSentCount: profileRes.metrics?.quotesSentCount ?? 0,
      quotesAcceptedCount: profileRes.metrics?.quotesAcceptedCount ?? 0,
      averageRating: profileRes.reputation?.averageRating ?? profileRes.averageRating ?? 0,
      reviewCount: profileRes.reputation?.reviewCount ?? profileRes.reviewCount ?? 0,
      requestHistory: profileRes.metrics?.requestHistory ?? [],
      quoteSentHistory: profileRes.metrics?.quoteSentHistory ?? [],
    });
    setHasLoadedMetrics(true);
    setMetricsError(false);
  };

  const loadProviderMetrics = async () => {
    try {
      const profileRes = await refreshProfile();
      if (!profileRes) {
        throw new Error("No se pudo obtener el perfil del proveedor");
      }
      applyProviderMetrics(profileRes);
      await refreshLoginProfile(profileRes);
    } catch (error) {
      setMetricsError(true);
      console.error("Error loading provider metrics:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onProviderStatusChanged(async (data) => {
      toast.success(`${data.title}: ${data.message}`, { duration: 6000 });
      await refreshLoginProfile();
    });
    return unsubscribe;
  }, [onProviderStatusChanged, refreshLoginProfile]);

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        await loadProviderMetrics();

        const [requestsRes, quotesRes, ordersRes] = await Promise.all([
          getProviderRequests(jwt, "pending,viewed"),
          getProviderQuotes(jwt, "sent,viewed,accepted"),
          getProviderOrders(jwt),
        ]);
        if (requestsRes.ok) {
          setRequests(requestsRes.data.requests);
        }
        if (quotesRes.ok) {
          setQuotes(quotesRes.data.quotes);
        }
        if (ordersRes.ok) {
          setOrders(ordersRes.data.orders);
          setNewOrdersCount(
            ordersRes.data.orders.filter(
              (o: ProviderOrderData) => o.status === "active",
            ).length,
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
    // refreshLoginProfile is a stable useCallback(fn,[]) — intentionally omitted
    // to prevent re-running this effect on every render cycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  useEffect(() => {
    const unsubscribe = onNotification((notification) => {
      if (
        notification.type === "provider.order_generated" ||
        notification.type === "provider.request_assigned" ||
        notification.type === "provider.payment_notified" ||
        notification.type === "review.received"
      ) {
        const fetchData = async () => {
          if (!jwt) return;
          try {
            const [requestsRes, quotesRes, ordersRes] = await Promise.all([
              getProviderRequests(jwt, "pending,viewed"),
              getProviderQuotes(jwt, "sent,viewed,accepted"),
              getProviderOrders(jwt),
            ]);
            if (requestsRes.ok) {
              setRequests(requestsRes.data.requests);
            }
            if (quotesRes.ok) {
              setQuotes(quotesRes.data.quotes);
            }
            if (ordersRes.ok) {
              setOrders(ordersRes.data.orders);
              setNewOrdersCount(
                ordersRes.data.orders.filter(
                  (o: ProviderOrderData) => o.status === "active",
                ).length,
              );
            }
            await loadProviderMetrics();
          } catch (error) {
            console.error("Error refreshing data:", error);
          }
        };
        fetchData();
      }
    });

    return unsubscribe;
  }, [jwt, onNotification, refreshProfile, refreshLoginProfile]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "COTIZACIONES":
        if (loading)
          return <p className={styles.loadingText}>Cargando cotizaciones...</p>;
        if (quotes.length === 0)
          return (
            <p className={styles.emptyText}>No has enviado cotizaciones aún</p>
          );

        return quotes.slice(0, 3).map((quote) => {
          const quoteCodeShort = quote.quoteCode.split("-").slice(2).join("-");
          return (
            <PriceCard
              key={quote.documentId}
              id={quoteCodeShort}
              date={new Date(quote.createdAt).toLocaleDateString("es-ES")}
              workshop={quote.request.client.username}
              amount={quote.priceTotal.toFixed(2)}
              time={quote.deliveryTime}
              items={quote.items.map((item) => ({
                name: item.productName,
                model: `${quote.request.vehicle.brand} ${quote.request.vehicle.model} ${quote.request.vehicle.year}`,
                type: item.availableQuantity?.toString() || "-",
              }))}
              totalSolicitados={quote.request.items.length}
              isProvider={true}
              documentId={quote.documentId}
              onViewQuote={(docId) =>
                router.push(`/home/vendor/quotes/${docId}`)
              }
            />
          );
        });

      case "SOLICITUDES":
        if (loading)
          return <p className={styles.loadingText}>Cargando solicitudes...</p>;
        if (requests.length === 0)
          return <p className={styles.emptyText}>No hay solicitudes aún</p>;

        return requests.slice(0, 3).map((req) => (
          <RequestCard
            key={req.documentId}
            id={req.id.toString().padStart(5, "0")}
            date={new Date(req.createdAt).toLocaleDateString("es-ES")}
            documentId={req.documentId}
            onViewOffers={(docId) =>
              router.push(`/home/vendor/request/${docId}`)
            }
            isProvider={true}
            items={req.request.items.map((item) => ({
              name: item.productName,
              model: `${req.request.vehicle.brand} ${req.request.vehicle.model} ${req.request.vehicle.year}`,
              type:
                item.conditionPreferred === "no_importa"
                  ? "Cualquiera"
                  : item.conditionPreferred,
            }))}
          />
        ));

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
              title={o.client?.username || ""}
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
              onViewOrder={(docId) =>
                router.push(`/home/vendor/orders/${docId}`)
              }
            />
          ));
        }
      default:
        return null;
    }
  };

  const providerStatus = loginProfile?.status;
  const showMetricsFallback = metricsError && !hasLoadedMetrics;
  const emptyHistoryEntries: RequestHistoryEntry[] = [
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
    { month: "", count: 0 },
  ];
  const requestHistoryEntries =
    metrics.requestHistory.length > 0 ? metrics.requestHistory : emptyHistoryEntries;
  const quoteHistoryEntries =
    metrics.quoteSentHistory.length > 0 ? metrics.quoteSentHistory : emptyHistoryEntries;
  const requestHistoryMaxCount = Math.max(
    ...metrics.requestHistory.map((entry) => entry.count),
    1,
  );
  const quoteHistoryMaxCount = Math.max(
    ...metrics.quoteSentHistory.map((entry) => entry.count),
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

  const statusBannerConfig: Record<
    string,
    { title: string; body: string; linkLabel?: string; linkPath?: string }
  > = {
    incomplete: {
      title: "Perfil incompleto",
      body: "Para recibir consultas debes completar tu perfil comercial.",
      linkLabel: "Completar perfil",
      linkPath: "/profile/vendor",
    },
    pending: {
      title: "Cuenta pendiente de confirmación",
      body: "Revisa tu correo para confirmar tu cuenta y continuar con el registro.",
    },
    in_review: {
      title: "Perfil en revisión",
      body: "El equipo de Lupea está revisando tu información. Te notificaremos cuando se active tu cuenta.",
    },
    suspended: {
      title: "Cuenta suspendida",
      body: "Tu cuenta ha sido suspendida. Contacta a soporte para más información.",
    },
  };

  const activeBanner =
    providerStatus && providerStatus !== "active"
      ? statusBannerConfig[providerStatus] ?? null
      : null;

  const bannerIcon: Record<string, string> = {
    incomplete: "⚠️",
    pending: "📧",
    in_review: "🔍",
    suspended: "🚫",
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        {activeBanner && providerStatus && (
          <div
            className={`${styles.statusBanner} ${styles[providerStatus]}`}
          >
            <span className={styles.statusBannerIcon}>
              {bannerIcon[providerStatus]}
            </span>
            <div className={styles.statusBannerText}>
              <div className={styles.statusBannerTitle}>{activeBanner.title}</div>
              <div className={styles.statusBannerBody}>{activeBanner.body}</div>
              {activeBanner.linkLabel && activeBanner.linkPath && (
                <button
                  className={styles.statusBannerLink}
                  onClick={() => router.push(activeBanner.linkPath!)}
                >
                  {activeBanner.linkLabel}
                </button>
              )}
            </div>
          </div>
        )}
        <div className={styles.leftSection}>
          <section className={styles.summaryCard}>
            <p className={styles.summaryLabel}>MIS LUPAS DISPONIBLES</p>
            <h2 className={styles.summaryValue}>
              {tokensAvailable.toLocaleString()}
            </h2>

            <div className={styles.divider}></div>
          </section>

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
                  {showMetricsFallback ? "--" : metrics.requestsReceivedCount}
                </h4>
                <p className={styles.metricSmallText}>Consultas recibidas</p>
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
                  {showMetricsFallback ? "--" : metrics.quotesSentCount}
                </h4>
                <p className={styles.metricSmallText}>Cotizaciones enviadas</p>
              </div>

              <div className={styles.metricCardGreen}>
                <div className={styles.chartPie}>
                  <IconsApp.Chart />
                </div>
                <h4 className={styles.metricBigNum}>
                  {showMetricsFallback ? "--" : metrics.quotesAcceptedCount}
                </h4>
                <p className={styles.metricSmallText}>Cotizaciones aceptadas</p>
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
        <div className={styles.rightSection}>
          <section className={styles.ofertasContainer}>
            <nav className={styles.tabs}>
              {["SOLICITUDES", "COTIZACIONES", "ÓRDENES"].map((tab) => (
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
                  ? "Cotizaciones enviadas"
                  : activeTab === "SOLICITUDES"
                    ? "Consultas nuevas"
                    : "Órdenes generadas"}
              </h3>
              {activeTab === "SOLICITUDES" && newRequestsCount > 0 && (
                <span className={styles.badgeNuevas}>
                  {newRequestsCount} Nuevas
                </span>
              )}
              {activeTab === "ÓRDENES" && newOrdersCount > 0 && (
                <span className={styles.badgeNuevas}>
                  {newOrdersCount} Nuevas
                </span>
              )}
            </div>

            {renderTabContent()}

            <button
              className={styles.btnVerTodas}
              onClick={() => {
                if (activeTab === "COTIZACIONES") {
                  router.push("/home/vendor/quotes");
                } else if (activeTab === "SOLICITUDES") {
                  router.push("/home/vendor/allRequests");
                } else {
                  router.push("/home/vendor/orders");
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
