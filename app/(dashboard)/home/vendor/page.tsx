"use client";

import { useEffect, useState } from "react";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import StarRating from "@/components/star-rating/StarRating";

import styles from "./Home.module.css";
import { RequestCard } from "@/components/request-card/RequestCard";
import { PriceCard } from "@/components/price-card/PriceCard";
import { OrderCard } from "@/components/order-card/OrderCard";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  getProviderRequests,
  ProviderQuoteRequest,
} from "@/app/lib/api/provider/home/request";
import {
  getProviderQuotes,
  ProviderQuote,
} from "@/app/lib/api/provider/home/quote";

export default function HomePage() {
  const { jwt, loginProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("SOLICITUDES");

  const [requests, setRequests] = useState<ProviderQuoteRequest[]>([]);
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [loading, setLoading] = useState(true);

  const tokensAvailable = loginProfile?.tokensAvailable ?? 0;
  const tokensTotal = loginProfile?.tokensTotal ?? 0;
  const tokensPercentage = loginProfile?.monthlyConsumption?.percentage ?? 0;
  const tokensLastRenewal = loginProfile?.tokensLastRenewal
    ? new Date(loginProfile.tokensLastRenewal).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  useEffect(() => {
    const fetchHomeData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const [requestsRes, quotesRes] = await Promise.all([
          getProviderRequests(jwt),
          getProviderQuotes(jwt),
        ]);
        if (requestsRes.ok) {
          setRequests(requestsRes.data.requests);
        }
        if (quotesRes.ok) {
          setQuotes(quotesRes.data.quotes);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [jwt]);

  const mockOrders = [
    {
      id: "88420",
      title: "Taller Mecánico 'El Rayo'",
      cantidadRepuestos: 7,
      status: "ACTIVA",
    },
    {
      id: "88421",
      title: "Servicio Autorizado Bosch",
      cantidadRepuestos: 3,
      status: "CANCELADA",
    },
    {
      id: "88422",
      title: "Frenos Santiago",
      cantidadRepuestos: 5,
      status: "COMPLETADA",
    },
  ] as const;

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
                type: item.availability,
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
            onViewOffers={(docId) => router.push(`/home/vendor/${docId}`)}
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
        return mockOrders
          .slice(0, 3)
          .map((o) => <OrderCard key={o.id} {...o} />);
      default:
        return null;
    }
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
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
              <span className={styles.dateText}>{tokensLastRenewal}</span>
            </div>
          </section>

          <section className={styles.metricsContainer}>
            <h3 className={styles.title}>Mis Métricas</h3>
            <div className={styles.metricsGrid}>
              <div className={styles.metricCardPurple}>
                <div className={styles.chartBars}>
                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: "40%" }}></div>
                    <span className={styles.barNumber}>5</span>
                  </div>

                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: "65%" }}></div>
                    <span className={styles.barNumber}>9</span>
                  </div>

                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: "90%" }}></div>
                    <span className={styles.barNumber}>10</span>
                  </div>

                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: "40%" }}></div>
                    <span className={styles.barNumber}>5</span>
                  </div>

                  <div className={styles.barContainer}>
                    <div className={styles.bar} style={{ height: "60%" }}></div>
                    <span className={styles.barNumber}>7</span>
                  </div>
                </div>
                <h4 className={styles.metricBigNum}>45</h4>
                <p className={styles.metricSmallText}>Consultas realizadas</p>
              </div>

              <div className={styles.metricsStack}>
                <div className={styles.metricCardGreen}>
                  <div className={styles.metricHeader}>
                    <span className={styles.metricBigNum}>12</span>

                    <p className={styles.metricSmallText}>Compras realizadas</p>
                  </div>
                  <div className={styles.chartPie}>
                    <IconsApp.Chart />
                  </div>
                </div>

                <div className={styles.metricCardOrange}>
                  <div className={styles.stars}>
                    <StarRating rating={3} />
                  </div>
                  <h4 className={styles.smallNum}>3.2</h4>
                  <p className={styles.metricSmallText}>Tu reputación</p>
                </div>
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
                  ? "Solicitudes nuevas"
                  : "Órdenes generadas"}
              </h3>
              {activeTab === "SOLICITUDES" && requests.length > 0 && (
                <span className={styles.badgeNuevas}>
                  {requests.length} Nuevas
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
