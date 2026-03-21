"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import styles from "./Orders.module.css";
import { IconsApp } from "@/components/icons/Icons";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getMyClientOrders, OrderData } from "@/app/lib/api/client/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";

const PurchaseOrders: React.FC = () => {
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getMyClientOrders(jwt);
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

  const handleCancelClick = () => {
    console.log("Cancel order");
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
          {/* <p className={styles.summaryText}>
          Se creó una orden por cada proveedor seleccionado:
          <br />
          <strong>{orders.length} Órdenes generadas</strong>
        </p>

        {showInfoBox && (
          <div className={styles.noteBox}>
            <p className={styles.noteText}>
              <strong>Nota:</strong> Cada proveedor recibirá la orden
              automáticamente. Puedes gestionar el seguimiento desde la sección{" "}
              <strong>&quot;Órdenes&quot;</strong>
            </p>
            <button
              className={styles.closeNote}
              onClick={() => setShowInfoBox(false)}
              aria-label="Cerrar nota"
            >
              <IconsApp.Close />
            </button>
          </div>
        )} */}

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
                  onCancelClick={handleCancelClick}
                />
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PurchaseOrders;
