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
import { getOrderChatAsProvider, completeProviderOrderCash } from "@/app/lib/api/provider/chat";
import { getClientOrderReview } from "@/app/lib/api/client/review";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";
import { useSidebar } from "@/context/SidebarContext";
import toast from "react-hot-toast";

const VendorOrderDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const [order, setOrder] = useState<ProviderOrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasClientReview, setHasClientReview] = useState(false);
  const [completingOrder, setCompletingOrder] = useState(false);
  const [showCompleteCashModal, setShowCompleteCashModal] = useState(false);
  const { isExpanded } = useSidebar();

  useEffect(() => {
    const fetchOrder = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getProviderOrderById(jwt, params.id as string);
        if (res.ok) {
          setOrder(res.data.order);
          const reviewRes = await getClientOrderReview(jwt, res.data.order.id.toString());
          setHasClientReview(reviewRes.ok && !!reviewRes.data?.review);
        }
      } catch (error) {
        console.error("Error loading order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [jwt, params.id]);

  const handleChatClick = async () => {
    if (!jwt || !order) return;
    try {
      const res = await getOrderChatAsProvider(jwt, order.documentId);
      if (res.ok) {
        router.push(`/chat/vendor/${res.data.chat.documentId}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  const handleCompleteAsCash = async () => {
    if (!jwt || !order) return;
    try {
      setCompletingOrder(true);
      await completeProviderOrderCash(jwt, order.id.toString());
      setOrder((prev) => prev ? { ...prev, status: "completed" } : null);
      toast.success("Orden completada");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al completar la orden");
    } finally {
      setCompletingOrder(false);
    }
  };

  const handleReviewClick = () => {
    if (!order) return;
    router.push(`/home/vendor/orders/${order.id}/review`);
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
            onReviewClick={handleReviewClick}
            showReviewButton={order.status === "completed" && !hasClientReview}
            isProvider={true}
            onCompleteCashClick={() => setShowCompleteCashModal(true)}
            showCompleteCashButton={order.status === "active" && !completingOrder}
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={showCompleteCashModal}
        onClose={() => setShowCompleteCashModal(false)}
        onConfirm={handleCompleteAsCash}
        title="¿Completar orden?"
        description="Confirma que recibiste el pago en efectivo y entregaste los productos al cliente."
        confirmText="Sí, completar"
        cancelText="No, volver"
        variant="warning"
      />
    </div>
  );
};

export default VendorOrderDetailPage;
