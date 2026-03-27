"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import styles from "./OrderDetail.module.css";
import Header from "@/components/header/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getProviderOrderById,
  ProviderOrderData,
} from "@/app/lib/api/provider/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import { useSidebar } from "@/context/SidebarContext";

const VendorOrderDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const [order, setOrder] = useState<ProviderOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const { isExpanded } = useSidebar();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getProviderOrderById(jwt, params.id as string);
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

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <main className={styles.mainContainer}>
          <Header title="Detalle de Orden" />
          <div className={styles.container}>
            <SkeletonOrders />
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.pageWrapper}>
        <main className={styles.mainContainer}>
          <Header title="Detalle de Orden" />
          <div className={styles.container}>
            <div className={styles.container}>
              <p className={styles.emptyText}>Orden no encontrada</p>
            </div>
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
          onBack={() => router.replace("/home/vendor")}
        />

        <div className={styles.container}>
          <OrderDetailCard
            order={order}
            isExpanded={true}
            showExpandButton={false}
            onChatClick={handleChatClick}
            isProvider={true}
          />
        </div>
      </main>
    </div>
  );
};

export default VendorOrderDetailPage;
