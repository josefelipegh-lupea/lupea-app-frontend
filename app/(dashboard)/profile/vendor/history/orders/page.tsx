"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import {
  getProviderOrders,
  ProviderOrderData,
} from "@/app/lib/api/provider/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import Header from "@/components/header/Header";
import styles from "../../History.module.css";

export default function VendorHistoryOrdersPage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [orders, setOrders] = useState<ProviderOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        // Sin filtro — historial completo de todos los statuses
        const res = await getProviderOrders(jwt);
        if (res.ok) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error("Error loading history orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [jwt]);

  const toggleOrder = (id: string) => {
    const card = cardRefs.current[id];
    setExpandedOrderId((prev) => (prev === id ? null : id));
    if (card) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const headerHeight = 600;
          const targetScroll =
            card.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({ top: targetScroll, behavior: "smooth" });
        });
      });
    }
  };

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Historial de Órdenes" />
          <div className={styles.content}>
            <SkeletonOrders />
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
        <Header title="Historial de Órdenes" />
        <div className={styles.content}>
          {orders.length === 0 ? (
            <p className={styles.emptyText}>No hay órdenes en el historial.</p>
          ) : (
            orders.map((order) => {
              const expanded = expandedOrderId === order.documentId;
              return (
                <div
                  key={order.documentId}
                  ref={(el) => {
                    cardRefs.current[order.documentId] = el;
                  }}
                >
                  <OrderDetailCard
                    order={order}
                    isExpanded={expanded}
                    onToggle={() => toggleOrder(order.documentId)}
                    onChatClick={() => {}}
                    isProvider={true}
                  />
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
