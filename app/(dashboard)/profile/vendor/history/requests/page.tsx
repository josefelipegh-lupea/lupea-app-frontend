"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { RequestCard } from "@/components/request-card/RequestCard";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import {
  getProviderRequests,
  ProviderQuoteRequest,
} from "@/app/lib/api/provider/home/request";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import styles from "../../History.module.css";

export default function VendorHistoryRequestsPage() {
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [requests, setRequests] = useState<ProviderQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        // Sin filtro — historial completo de todos los statuses
        const res = await getProviderRequests(jwt, "");
        if (res.ok) {
          setRequests(res.data.requests);
        }
      } catch (error) {
        console.error("Error loading history requests:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [jwt]);

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Historial de Consultas" />
          <div className={styles.content}>
            <SkeletonComparison />
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
        <Header title="Historial de Consultas" />
        <div className={styles.content}>
          {requests.length === 0 ? (
            <p className={styles.emptyText}>No hay consultas en el historial.</p>
          ) : (
            requests.map((req) => (
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
            ))
          )}
        </div>
      </main>
    </div>
  );
}
