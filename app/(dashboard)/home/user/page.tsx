"use client";

import { useEffect, useState } from "react";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import StarRating from "@/components/star-rating/StarRating";

import { RequestCard } from "@/components/request-card/RequestCard";
import { PriceCard } from "@/components/price-card/PriceCard";
import { OrderCard } from "@/components/order-card/OrderCard";
import Button from "@/components/button/Button";
import { useRouter } from "next/navigation";
import {
  getMyRequests,
  QuoteRequest,
} from "@/app/lib/api/client/home/request";
import {
  getClientRequestQuotes,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import { useAuth } from "@/context/AuthContext";
import styles from "./Home.module.css";

interface FeaturedQuoteData {
  request: QuoteRequest;
  featuredQuote: ClientQuote;
}

export default function HomePage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("COTIZACIONES");

  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [featuredQuotes, setFeaturedQuotes] = useState<FeaturedQuoteData[]>([]);
  const [loading, setLoading] = useState(true);

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
    {
      id: "88423",
      title: "Taller Mecánico 'El Rayo'",
      cantidadRepuestos: 12,
      status: "ACTIVA",
    },
    {
      id: "88424",
      title: "Taller Mecánico 'El Rayo'",
      cantidadRepuestos: 2,
      status: "COMPLETADA",
    },
  ] as const;

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getMyRequests(jwt);
        if (res.ok) {
          setRequests(res.data.requests);

          const requestsWithQuotes = res.data.requests.filter(
            (r) => r.quotesReceived > 0
          );

          const featuredData = await Promise.all(
            requestsWithQuotes.slice(0, 3).map(async (request) => {
              const quotesRes = await getClientRequestQuotes(
                jwt,
                request.documentId
              );
              if (quotesRes.ok && quotesRes.data.featuredQuote) {
                return {
                  request,
                  featuredQuote: quotesRes.data.featuredQuote,
                };
              }
              return null;
            })
          );

          setFeaturedQuotes(
            featuredData.filter((d): d is FeaturedQuoteData => d !== null)
          );
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwt]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "COTIZACIONES":
        if (loading)
          return <p className={styles.loadingText}>Cargando cotizaciones...</p>;
        if (featuredQuotes.length === 0)
          return (
            <p className={styles.emptyText}>
              No tienes cotizaciones todavía.
            </p>
          );

        return featuredQuotes.slice(0, 3).map((data) => {
          const quoteCodeShort = data.featuredQuote.quoteCode
            .split("-")
            .slice(2)
            .join("-");
          return (
            <PriceCard
              key={data.featuredQuote.documentId}
              id={quoteCodeShort}
              date={new Date(
                data.featuredQuote.createdAt
              ).toLocaleDateString("es-ES")}
              workshop={data.featuredQuote.provider.businessName}
              amount={data.featuredQuote.priceTotal.toFixed(2)}
              time={data.featuredQuote.deliveryTime}
              items={data.featuredQuote.items.map((item) => ({
                name: item.productName,
                model: `${data.request.vehicle.brand} ${data.request.vehicle.model} ${data.request.vehicle.year}`,
                type: item.availability,
              }))}
              totalSolicitados={data.request.items.length}
              documentId={data.request.documentId}
              onCompare={(docId) => router.push(`/home/user/request/${docId}/comparison`)}
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

        return requests.slice(0, 3).map((req) => (
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
        {/* 1. CARD DE LUPAS */}
        <div className={styles.leftSection}>
          <section className={styles.summaryCard}>
            <p className={styles.summaryLabel}>MIS LUPAS DISPONIBLES</p>
            <h2 className={styles.summaryValue}>10.583</h2>
            <p className={styles.summaryTotal}>de 50.000 totales</p>

            <div className={styles.progressHeader}>
              <span>Consumo del mes</span>
              <span className={styles.percentaje}>80%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: "80%" }}
              ></div>
            </div>

            <div className={styles.divider}></div>

            <div className={styles.renovacionRow}>
              <span className={styles.renovacionLabel}>Renovación mensual</span>
              <span className={styles.dateText}>01 Feb 2026</span>
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
              {/* Gráfico */}
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

              {/* Columna derecha de métricas */}
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
              {activeTab === "COTIZACIONES" && (
                <span className={styles.badgeNuevas}>3 Nuevas</span>
              )}
            </div>

            {renderTabContent()}

            <button className={styles.btnVerTodas}>
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
