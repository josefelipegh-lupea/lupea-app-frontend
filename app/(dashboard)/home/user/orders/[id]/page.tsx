"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./OrderDetail.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { getOrderById, cancelClientOrder, OrderData } from "@/app/lib/api/client/home/order";
import { getOrderChatAsClient, notifyClientPayment } from "@/app/lib/api/client/chat";
import { getOrderReview } from "@/app/lib/api/provider/review";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";
import PaymentSheet from "@/components/chat/PaymentSheet";

const OrderDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const { onNotification } = useSocket();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasReview, setHasReview] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [notifyingPayment, setNotifyingPayment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getOrderById(jwt, params.id as string);
        if (res.ok) {
          setOrder(res.data.order);

          const savedMethod = localStorage.getItem(`lupea_payment_${res.data.order.documentId}`);
          if (savedMethod) setSelectedPaymentMethod(savedMethod);

          console.log("Order status:", res.data.order.status, "orderId:", params.id, "order.id:", res.data.order.id);

          if (res.data.order.status === "completed") {
            const reviewRes = await getOrderReview(jwt, res.data.order.id.toString());
            console.log("Review check:", reviewRes);
            setHasReview(reviewRes.ok && !!reviewRes.data?.review);
          }
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
      const res = await getOrderChatAsClient(jwt, order.documentId);
      if (res.ok) {
        router.push(`/chat/user/${res.data.chat.documentId}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
    }
  };

  useEffect(() => {
    if (!order) return;
    const unsubscribe = onNotification((notification) => {
      if (
        notification.type === "client.order_completed" &&
        notification.data?.orderId === order.id
      ) {
        setOrder((prev) => prev ? { ...prev, status: "completed" } : null);
      }
    });
    return unsubscribe;
  }, [order?.id, onNotification]);

  const handlePaymentMethodSelect = (method: string) => {
    setSelectedPaymentMethod(method);
    if (order) localStorage.setItem(`lupea_payment_${order.documentId}`, method);
  };

  const handleNotifyPaymentClick = () => setShowPaymentSheet(true);

  const handlePaymentConfirm = async (file: File, note?: string) => {
    if (!jwt || !order) return;
    try {
      setNotifyingPayment(true);
      await notifyClientPayment(jwt, order.id.toString(), note, file);
      setShowPaymentSheet(false);
      toast.success("Pago notificado al proveedor");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al notificar el pago");
    } finally {
      setNotifyingPayment(false);
    }
  };

  const handleCancelClick = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!jwt || !order) return;
    try {
      setCancelLoading(true);
      const res = await cancelClientOrder(jwt, order.documentId);
      if (res.ok) {
        setOrder(res.data.order);
        toast.success("Orden cancelada exitosamente");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar la orden");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReviewClick = () => {
    if (order) {
      setHasReview(true);
      router.push(`/home/user/orders/${order.id}/review`);
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
            onReviewClick={handleReviewClick}
            showReviewButton={order.status === "completed" && !hasReview}
            showCancelButton={order.status !== "completed" && order.status !== "cancelled"}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={handlePaymentMethodSelect}
            onNotifyPaymentClick={handleNotifyPaymentClick}
            showNotifyPaymentButton={
              order.status === "active" &&
              selectedPaymentMethod !== null &&
              selectedPaymentMethod !== "Efectivo"
            }
          />
        </div>
      </main>

      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancel}
        title="¿Cancelar orden?"
        description="Esta acción no se puede deshacer. La orden quedará cancelada."
        confirmText="Sí, cancelar"
        cancelText="No, mantener"
        variant="danger"
      />
      <PaymentSheet
        isOpen={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onConfirm={handlePaymentConfirm}
        loading={notifyingPayment}
      />
    </div>
  );
};

export default OrderDetailPage;
