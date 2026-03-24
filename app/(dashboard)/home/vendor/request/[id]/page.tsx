"use client";

import { useEffect, useState } from "react";
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
  ProviderQuoteRequest,
} from "@/app/lib/api/provider/home/request";
import Header from "@/components/header/Header";

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [request, setRequest] = useState<ProviderQuoteRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getProviderRequests(jwt);
        if (res.ok) {
          const found = res.data.requests.find(
            (r) => r.documentId === params.id
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

  if (loading) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <div className={styles.mainContainer}>
            <Header title="Detalle de Solicitud" />
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
          <p>Solicitud no encontrada</p>
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
                    Solicitud {request.id.toString().padStart(5, "0")}
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

            <section className={styles.card}>
              <h3 className={styles.cardTitle}>Vehículo</h3>
              <div className={styles.vehicleInfo}>
                <div className={styles.iconCircle}>
                  <IconsApp.Car />
                </div>
                <div className={styles.vehicleDetails}>
                  <h4 className={styles.vehicleName}>{vehicleInfo}</h4>
                  <p className={styles.vehicleExtra}>
                    {request.request.vehicle.version} •{" "}
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
                    <p className={styles.locationAddress}>
                      {locationInfo.exactAddress}
                    </p>
                    <p className={styles.locationParish}>
                      {locationInfo.parish}, {locationInfo.municipality},{" "}
                      {locationInfo.state}
                    </p>
                  </div>
                </div>
              </div>
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
              <h3 className={styles.cardTitle}>Criterios de coincidencia</h3>
              <div className={styles.criteriaGrid}>
                <div className={styles.criteriaItem}>
                  <span className={styles.criteriaLabel}>Score</span>
                  <span className={styles.criteriaValue}>{request.score}%</span>
                </div>
                <div className={styles.criteriaItem}>
                  <span className={styles.criteriaLabel}>Coincidencias</span>
                  <span className={styles.criteriaValue}>
                    {request.criteria.matchedItemCount} de{" "}
                    {request.criteria.totalItems}
                  </span>
                </div>
                <div className={styles.criteriaItem}>
                  <span className={styles.criteriaLabel}>Categorías</span>
                  <span className={styles.criteriaValue}>
                    {request.criteria.matchedCategoryNames.join(", ")}
                  </span>
                </div>
                <div className={styles.criteriaItem}>
                  <span className={styles.criteriaLabel}>Entrega</span>
                  <span className={styles.criteriaValue}>
                    {request.criteria.logistics.deliveryPreference ===
                    "delivery"
                      ? "Delivery"
                      : "Retiro en tienda"}
                  </span>
                </div>
                <div className={styles.criteriaItem}>
                  <span className={styles.criteriaLabel}>Marca vehículo</span>
                  <span className={styles.criteriaValue}>
                    {request.criteria.vehicleBrand.name}
                  </span>
                </div>
              </div>
            </section>

            {request.status === "pending" && (
              <div className={styles.actionsContainer}>
                <Button className={styles.btnPrimary}>Enviar cotización</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}
