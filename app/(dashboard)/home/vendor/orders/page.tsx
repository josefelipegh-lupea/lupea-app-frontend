"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import styles from "./Orders.module.css";
import { IconsApp } from "@/components/icons/Icons";
import Header from "@/components/header/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getProviderOrders,
  ProviderOrderData,
} from "@/app/lib/api/provider/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import { useSidebar } from "@/context/SidebarContext";

const AllVendorOrdersPage: React.FC = () => {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();

  const [orders, setOrders] = useState<ProviderOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getProviderOrders(jwt);
        if (res.ok) {
          setOrders(res.data.orders);
        }
      } catch (error) {
        console.error("Error loading orders:", error);
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
          window.scrollTo({
            top: targetScroll,
            behavior: "smooth",
          });
        });
      });
    }
  };

  const handleChatClick = () => {
    console.log("Open chat");
  };

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Órdenes" />
          <div className={styles.container}>
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
        <Header title="Órdenes" />

        <div className={styles.container}>
          <p className={styles.summaryText}>
            Órdenes recibidas de tus clientes:
            <br />
            <strong>{orders.length} Órdenes</strong>
          </p>

          {showInfoBox && (
            <div className={styles.noteBox}>
              <p className={styles.noteText}>
                <strong>Nota:</strong> Cada orden representa una solicitud de
                compra de un cliente. Gestiona el seguimiento desde esta
                sección.
              </p>
              <button
                className={styles.closeNote}
                onClick={() => setShowInfoBox(false)}
                aria-label="Cerrar nota"
              >
                <IconsApp.Close />
              </button>
            </div>
          )}

          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.documentId;

            return (
              <div
                key={order.documentId}
                ref={(el) => {
                  cardRefs.current[order.documentId] = el;
                }}
              >
                <OrderDetailCard
                  order={order}
                  isExpanded={isExpanded}
                  onToggle={() => toggleOrder(order.documentId)}
                  onChatClick={handleChatClick}
                  isProvider={true}
                />
              </div>
            );
          })}

          {orders.length === 0 && (
            <p className={styles.emptyText}>No tienes órdenes todavía.</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default AllVendorOrdersPage;
