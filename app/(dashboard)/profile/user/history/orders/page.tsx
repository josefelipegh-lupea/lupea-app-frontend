"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { getMyClientOrders, OrderData } from "@/app/lib/api/client/home/order";
import { getOrderChatAsClient } from "@/app/lib/api/client/chat";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import Header from "@/components/header/Header";
import styles from "../History.module.css";

export default function UserHistoryOrdersPage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        // Sin filtro — historial completo (active, payment_validation, completed, cancelled)
        const res = await getMyClientOrders(jwt);
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

  const handleChatClick = async (order: OrderData) => {
    if (!jwt) return;
    try {
      const res = await getOrderChatAsClient(jwt, order.documentId);
      if (res.ok) {
        router.push(`/chat/user/${res.data.chat.documentId}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

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
                    onChatClick={() => handleChatClick(order)}
                    onCancelClick={() => {}}
                    showCancelButton={false}
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
