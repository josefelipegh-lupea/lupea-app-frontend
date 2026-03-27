"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import styles from "./OrderDetail.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getOrderById, OrderData } from "@/app/lib/api/client/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";

const OrderDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getOrderById(jwt, params.id as string);
        if (res.ok) {
          setOrder(res.data.order);
        }
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [jwt, params.id]);

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
          <Header
            title="Detalle de Orden"
            onBack={() => router.replace("/home/user")}
          />
          <div className={styles.container}>
            <SkeletonOrders />
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header
            title="Detalle de Orden"
            onBack={() => router.push("/home/user")}
          />
          <div className={styles.container}>
            <p className={styles.emptyText}>Orden no encontrada</p>
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
        <Header
          title="Detalle de Orden"
          onBack={() => router.push("/home/user")}
        />

        <div className={styles.container}>
          <OrderDetailCard
            order={order}
            isExpanded={true}
            showExpandButton={false}
            onChatClick={handleChatClick}
            onCancelClick={handleCancelClick}
          />
        </div>
      </main>
    </div>
  );
};

export default OrderDetailPage;
