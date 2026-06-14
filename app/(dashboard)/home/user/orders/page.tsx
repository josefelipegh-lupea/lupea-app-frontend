"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./Orders.module.css";
import { IconsApp } from "@/components/icons/Icons";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getMyClientOrders, cancelClientOrder, OrderData } from "@/app/lib/api/client/home/order";
import { notifyClientPayment } from "@/app/lib/api/client/chat";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import OrderDetailCard from "@/components/order-card/OrderDetailCard";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";
import PaymentSheet from "@/components/chat/PaymentSheet";

const PurchaseOrders: React.FC = () => {
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderData | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<Record<string, string>>({});
  const [orderForPayment, setOrderForPayment] = useState<OrderData | null>(null);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);
  const [notifyingPayment, setNotifyingPayment] = useState(false);

  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchOrders = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getMyClientOrders(jwt);
        if (res.ok) {
          setOrders(res.data.orders);
          const savedMethods: Record<string, string> = {};
          res.data.orders.forEach((o) => {
            const saved = localStorage.getItem(`lupea_payment_${o.documentId}`);
            if (saved) savedMethods[o.documentId] = saved;
          });
          setSelectedPaymentMethods(savedMethods);
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

  const handlePaymentMethodSelect = (order: OrderData) => (method: string) => {
    setSelectedPaymentMethods((prev) => ({ ...prev, [order.documentId]: method }));
    localStorage.setItem(`lupea_payment_${order.documentId}`, method);
  };

  const handleNotifyPaymentClick = (order: OrderData) => () => {
    setOrderForPayment(order);
    setShowPaymentSheet(true);
  };

  const handlePaymentConfirm = async (file: File, note?: string) => {
    if (!jwt || !orderForPayment) return;
    try {
      setNotifyingPayment(true);
      await notifyClientPayment(jwt, orderForPayment.id.toString(), note, file);
      setShowPaymentSheet(false);
      toast.success("Pago notificado al proveedor");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al notificar el pago");
    } finally {
      setNotifyingPayment(false);
      setOrderForPayment(null);
    }
  };

  const handleCancelClick = (order: OrderData) => () => {
    setOrderToCancel(order);
    setShowCancelModal(true);
  };

  const handleConfirmCancel = async () => {
    if (!jwt || !orderToCancel) return;
    try {
      setCancelLoading(true);
      const res = await cancelClientOrder(jwt, orderToCancel.documentId);
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.documentId === orderToCancel.documentId ? res.data.order : o))
        );
        toast.success("Orden cancelada exitosamente");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al cancelar la orden");
    } finally {
      setCancelLoading(false);
      setOrderToCancel(null);
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
                  onCancelClick={handleCancelClick(order)}
                  showCancelButton={order.status !== "completed" && order.status !== "cancelled"}
                  selectedPaymentMethod={selectedPaymentMethods[order.documentId] ?? null}
                  onPaymentMethodSelect={handlePaymentMethodSelect(order)}
                  onNotifyPaymentClick={handleNotifyPaymentClick(order)}
                  showNotifyPaymentButton={
                    order.status === "active" &&
                    !!selectedPaymentMethods[order.documentId] &&
                    selectedPaymentMethods[order.documentId] !== "Efectivo"
                  }
                />
              </div>
            );
          })}
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

export default PurchaseOrders;
