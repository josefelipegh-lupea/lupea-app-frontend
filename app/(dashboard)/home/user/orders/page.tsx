"use client";

import React, { useState, useEffect, useRef } from "react";

import styles from "./Orders.module.css";
import { IconsApp } from "@/components/icons/Icons";
import Header from "@/components/header/Header";
import { useAuth } from "@/context/AuthContext";
import { getMyClientOrders, OrderData } from "@/app/lib/api/client/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";

const PurchaseOrders: React.FC = () => {
  const { jwt } = useAuth();
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

  const formatStatus = (
    status: string
  ): "ACTIVA" | "CANCELADA" | "COMPLETADA" => {
    switch (status) {
      case "active":
        return "ACTIVA";
      case "cancelled":
        return "CANCELADA";
      case "completed":
        return "COMPLETADA";
      default:
        return "ACTIVA";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getDeliveryStatus = (deliveryTime: string): "today" | "tomorrow" => {
    return deliveryTime.toLowerCase().includes("hoy") ? "today" : "tomorrow";
  };

  const formatPaymentMethods = (methods: string[]) => {
    return methods.join(", ");
  };

  if (loading) {
    return (
      <div className={styles.pageWrapper}>
        <Header title="Órdenes" />
        <SkeletonOrders />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <Header title="Órdenes" />

      <main className={styles.container}>
        <p className={styles.summaryText}>
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
        )}

        {orders.map((order) => {
          const isExpanded = expandedOrderId === order.documentId;

          return (
            <section
              key={order.documentId}
              className={styles.card}
              ref={(el) => {
                cardRefs.current[order.documentId] = el;
              }}
            >
              <div
                className={styles.cardHeader}
                onClick={() => toggleOrder(order.documentId)}
              >
                <div className={styles.providerInfo}>
                  <div className={styles.iconWrapper}>
                    <IconsApp.Tool />
                  </div>
                  <span className={styles.providerName}>
                    {order.provider.businessName}
                  </span>
                </div>
                <div
                  className={`${styles.arrowIcon} ${
                    isExpanded ? styles.arrowIconRotated : ""
                  }`}
                >
                  <IconsApp.DownArrow />
                </div>
              </div>
              <div className={styles.divider} />

              <div className={styles.cardBody}>
                <div className={styles.infoRow}>
                  <span className={styles.orderNumber}>Orden #{order.id}</span>
                  <span className={styles.dateText}>
                    {formatDate(order.createdAt)}
                  </span>
                </div>

                <div className={styles.infoRow}>
                  <span className={styles.badgeActive}>
                    {formatStatus(order.status)}
                  </span>
                  <span className={styles.itemCountText}>
                    {order.items.length.toString().padStart(2, "0")}{" "}
                    {order.items.length === 1 ? "Repuesto" : "Repuestos"}
                  </span>
                </div>

                <div className={styles.cardDivider} />

                <div className={styles.priceRow}>
                  <span
                    className={`${styles.timeText} ${
                      getDeliveryStatus(order.quote.deliveryTime) === "today"
                        ? styles.green
                        : styles.orange
                    }`}
                  >
                    {getDeliveryStatus(order.quote.deliveryTime) === "today" ? (
                      <IconsApp.GreenClock />
                    ) : (
                      <IconsApp.OrangeClock />
                    )}
                    {order.quote.deliveryTime}
                  </span>
                  <span className={styles.totalText}>
                    Total ${order.subtotal.toFixed(0)}
                  </span>
                </div>
              </div>

              <div
                className={`${styles.expandedWrapper} ${
                  isExpanded ? styles.expandedWrapperOpen : ""
                }`}
              >
                <div className={styles.expandedContent}>
                  <ul className={styles.itemList}>
                    {isExpanded && <div className={styles.cardDivider} />}
                    {order.items.map((item) => (
                      <li key={item.documentId} className={styles.itemRow}>
                        <div className={styles.itemMainInfo}>
                          <p className={styles.itemName}>{item.productName}</p>
                          <p className={styles.itemSubText}>
                            {item.brand}
                            {item.brand && item.availability && " • "}
                            {item.availability}
                          </p>
                        </div>
                        <div className={styles.itemPriceWrapper}>
                          <span className={styles.itemPrice}>
                            ${item.price.toFixed(0)}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.subtotalContainer}>
                    <span className={styles.subtotalLabel}>Subtotal</span>
                    <span className={styles.subtotalValue}>
                      ${order.subtotal.toFixed(0)}
                    </span>
                  </div>

                  <h3 className={styles.sectionTitle}>
                    Condiciones comerciales
                  </h3>
                  <div className={styles.conditionsList}>
                    <ConditionCard
                      icon={<IconsApp.CreditCard />}
                      label="Forma de pago"
                      value={formatPaymentMethods(
                        order.conditions.paymentMethods
                      )}
                    />
                    <ConditionCard
                      icon={<IconsApp.OrangeClock height="20" width="20" />}
                      label="Tiempo de entrega"
                      value={order.conditions.deliveryTime}
                    />
                    <ConditionCard
                      icon={<IconsApp.Shield width="20" height="20" />}
                      label="Garantía"
                      value={order.conditions.warrantyPolicy}
                    />
                  </div>

                  <div className={styles.cardDivider} />

                  <h3 className={styles.sectionTitle}>
                    Información de contacto
                  </h3>
                  <div className={styles.contactContainer}>
                    <ContactRow
                      icon={
                        <IconsApp.Email
                          color="#BEBEBE"
                          width="24"
                          height="24"
                        />
                      }
                      label="Correo electrónico"
                      value={order.provider.contact.email}
                    />
                    <ContactRow
                      icon={<IconsApp.Phone />}
                      label="Teléfono"
                      value={order.provider.contact.phone}
                    />
                    <ContactRow
                      icon={
                        <IconsApp.Pin width="24" height="24" color="#BEBEBE" />
                      }
                      label="Dirección"
                      value={order.provider.contact.address}
                    />
                  </div>

                  <button className={styles.btnChat}>
                    <IconsApp.ChatBlue /> Chat con {order.provider.businessName}
                  </button>
                  <button className={styles.btnCancel}>Cancelar orden</button>
                </div>
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
};

const ConditionCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className={styles.conditionCard}>
    <div className={styles.condIconBox}>{icon}</div>
    <div className={styles.condText}>
      <small>{label}</small>
      <p>{value}</p>
    </div>
  </div>
);

const ContactRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className={styles.contactRow}>
    <div className={styles.contactIconBox}>{icon}</div>
    <div className={styles.contactInfoText}>
      <small>{label}</small>
      <p>{value}</p>
    </div>
  </div>
);

export default PurchaseOrders;
