"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { IconsApp } from "@/components/icons/Icons";
import { RequestCard } from "@/components/request-card/RequestCard";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import { getMyRequests, QuoteRequest } from "@/app/lib/api/client/home/request";
import styles from "./Requests.module.css";
import Header from "@/components/header/Header";

export default function AllRequestsPage() {
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getMyRequests(jwt);
        if (res.ok) {
          setRequests(res.data.requests);
        }
      } catch (error) {
        console.error("Error loading requests:", error);
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
          <Header title="Solicitudes" />
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
        <Header title="Solicitudes" />

        <div className={styles.content}>
          {requests.length === 0 ? (
            <p className={styles.emptyText}>No tienes solicitudes todavía.</p>
          ) : (
            requests.map((req) => (
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
                matchingSummary={req.matchingSummary}
                documentId={req.documentId}
                onViewOffers={(docId) => router.push(`/home/user/request/${docId}/quotes`)}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
