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

export default function HomePage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("SOLICITUDES");

  const [requests, setRequests] = useState<ProviderQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getProviderRequests(jwt);
        if (res.ok) {
          setRequests(res.data.requests);
        }
      } catch (error) {
        console.error("Error cargando solicitudes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [jwt]);

  const solicitudesMock = [
    {
      id: "00125",
      fecha: "20/05/2024",
      taller: "Taller Mecánico 'El Rayo'",
      reputacion: 3.5,
      monto: "150.000",
      tiempo: "24 Horas",
      items: [
        {
          nombre: "Pastillas de frenos delantea",
          modelo: "Toyota Corolla 2022",
          tipo: "Original",
        },
        {
          nombre: "Kit Distribución",
          modelo: "Volkswagen Golf VII",
          tipo: "OEM",
        },
        {
          nombre: "Kit Distribución",
          modelo: "Volkswagen Golf VII",
          tipo: "OEM",
        },
        {
          nombre: "Kit Distribución",
          modelo: "Volkswagen Golf VII",
          tipo: "OEM",
        },
      ],
    },
    {
      id: "00126",
      fecha: "21/05/2024",
      taller: "Servicio Autorizado Bosch",
      monto: "85.500",
      reputacion: 5,
      tiempo: "48 Horas",
      items: [
        {
          nombre: "Amortiguadores traseros",
          modelo: "Ford Ranger 2019",
          tipo: "Alternativo",
        },
      ],
    },
  ];

  const ordenesMock = [
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
        return solicitudesMock
          .slice(0, 3)
          .map((s) => <PriceCard key={s.id} {...s} />);

      case "SOLICITUDES":
        if (loading)
          return <p className={styles.loadingText}>Cargando solicitudes...</p>;
        if (requests.length === 0)
          return (
            <p className={styles.emptyText}>No tienes solicitudes nuevas.</p>
          );

        return requests.slice(0, 3).map((sol) => (
          <RequestCard
            key={sol.documentId}
            id={sol.id.toString().padStart(5, "0")}
            fecha={new Date(sol.createdAt).toLocaleDateString("es-ES")}
            documentId={sol.documentId}
            onVerOfertas={(docId) => router.push(`/home/vendor/${docId}`)}
            isProvider={true}
            items={sol.request.items.map((item) => ({
              nombre: item.productName,
              modelo: `${sol.request.vehicle.brand} ${sol.request.vehicle.model} ${sol.request.vehicle.year}`,
              tipo:
                item.conditionPreferred === "no_importa"
                  ? "Cualquiera"
                  : item.conditionPreferred,
            }))}
          />
        ));

      case "ÓRDENES":
        return ordenesMock
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
                  ? "Ofertas Recibidas"
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
