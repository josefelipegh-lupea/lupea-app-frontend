"use client";

import { useState } from "react";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import StarRating from "@/components/star-rating/StarRating";

import styles from "./Home.module.css";
import { RequestCard } from "@/components/request-card/RequestCard";
import { PriceCard } from "@/components/price-card/PriceCard";
import { OrderCard } from "@/components/order-card/OrderCard";

export default function HomePage() {
  const { isExpanded } = useSidebar();
  const [activeTab, setActiveTab] = useState("COTIZACIONES");

  const solicitudesEjemplo = [
    {
      id: "00125",
      fecha: "20/05/2024",
      taller: "Taller Mecánico 'El Rayo'",
      monto: "150.000",
      tiempo: "24 Horas",
      items: [
        {
          nombre: "Pastillas de frenos delantera",
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
      tiempo: "48 Horas",
      items: [
        {
          nombre: "Amortiguadores traseros",
          modelo: "Ford Ranger 2019",
          tipo: "Alternativo",
        },
      ],
    },
    {
      id: "00127",
      fecha: "22/05/2024",
      taller: "Frenos Santiago",
      monto: "42.000",
      tiempo: "12 Horas",
      items: [
        {
          nombre: "Líquido de frenos Dot4",
          modelo: "Universal",
          tipo: "Original",
        },
        { nombre: "Bomba de agua", modelo: "Chevrolet Sail", tipo: "OEM" },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
      ],
    },
    {
      id: "00130",
      fecha: "22/05/2024",
      taller: "Frenos Santiago",
      monto: "42.000",
      tiempo: "12 Horas",
      items: [
        {
          nombre: "Líquido de frenos Dot4",
          modelo: "Universal",
          tipo: "Original",
        },
        { nombre: "Bomba de agua", modelo: "Chevrolet Sail", tipo: "OEM" },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
        {
          nombre: "Correa de accesorios",
          modelo: "Chevrolet Sail",
          tipo: "Original",
        },
      ],
    },
  ];

  const ordenesEjemplo = [
    { id: "88420", cantidadRepuestos: 7, status: "ACTIVA" },
    { id: "88421", cantidadRepuestos: 3, status: "CANCELADA" },
    { id: "88422", cantidadRepuestos: 5, status: "COMPLETADA" },
    { id: "88423", cantidadRepuestos: 12, status: "ACTIVA" },
    { id: "88424", cantidadRepuestos: 2, status: "COMPLETADA" },
  ] as const;

  const renderTabContent = () => {
    switch (activeTab) {
      case "COTIZACIONES":
        return solicitudesEjemplo
          .slice(0, 3)
          .map((solicitud) => <PriceCard key={solicitud.id} {...solicitud} />);
      case "SOLICITUDES":
        return solicitudesEjemplo
          .slice(0, 3)
          .map((sol) => (
            <RequestCard
              key={sol.id}
              id={sol.id}
              fecha={sol.fecha}
              items={sol.items}
            />
          ));
      case "ÓRDENES":
        return ordenesEjemplo
          .slice(0, 3)
          .map((orden) => <OrderCard key={orden.id} {...orden} />);
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
          <button className={styles.btnNuevaSolicitud}>
            <span className={styles.plusIcon}>
              <IconsApp.Plus />
            </span>{" "}
            Nueva solicitud
          </button>

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
                    <StarRating rating={3.2} />
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
