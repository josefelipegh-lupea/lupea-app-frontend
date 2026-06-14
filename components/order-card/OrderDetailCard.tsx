import React from "react";

import styles from "../../app/(dashboard)/home/user/orders/Orders.module.css";
import { IconsApp } from "../icons/Icons";
import { formatDeliveryTimeLabel } from "@/app/utils/formatDeliveryTimeLabel";

interface OrderItem {
  documentId: string;
  productName: string;
  brand: string;
  availability: string;
  price: number;
  quantity: number;
  subtotal: number;
  warranty?: string;
  notes?: string;
}

interface OrderConditions {
  paymentMethods: string[];
  deliveryTime: string;
  warrantyPolicy: string;
}

interface OrderProvider {
  businessName: string;
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  location?: {
    name: string;
    state: string;
    municipality: string;
    parish: string;
  } | null;
}

interface OrderQuote {
  deliveryTime: string;
}

interface OrderClient {
  username: string;
  fullName?: string;
  contact?: {
    email: string;
    phone: string;
    address: string;
  };
}

interface CommonOrderData {
  id: number;
  documentId: string;
  status: string;
  subtotal: number;
  createdAt: string;
  provider: OrderProvider;
  quote: OrderQuote;
  conditions: OrderConditions;
  items: OrderItem[];
  client?: OrderClient;
  customer?: OrderClient;
}

interface OrderDetailCardProps {
  order: CommonOrderData;
  isProvider?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onChatClick?: () => void;
  onCancelClick?: () => void;
  onReviewClick?: () => void;
  showExpandButton?: boolean;
  showReviewButton?: boolean;
  showCancelButton?: boolean;
  selectedPaymentMethod?: string | null;
  onPaymentMethodSelect?: (method: string) => void;
  onNotifyPaymentClick?: () => void;
  showNotifyPaymentButton?: boolean;
  onCompleteCashClick?: () => void;
  showCompleteCashButton?: boolean;
}

const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
  order,
  isExpanded = false,
  onToggle,
  onChatClick,
  onCancelClick,
  onReviewClick,
  showExpandButton = true,
  showReviewButton = false,
  showCancelButton = true,
  isProvider = false,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  onNotifyPaymentClick,
  showNotifyPaymentButton = false,
  onCompleteCashClick,
  showCompleteCashButton = false,
}) => {
  const formatStatus = (
    status: string,
  ): "ACTIVA" | "CANCELADA" | "COMPLETADA" | "PAGO PENDIENTE" => {
    switch (status) {
      case "active":
        return "ACTIVA";
      case "payment_validation":
        return "PAGO PENDIENTE";
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

  return (
    <section className={styles.card}>
      {!isProvider && (
        <>
          <div className={styles.cardHeader} onClick={onToggle}>
            <div className={styles.providerInfo}>
              <div className={styles.iconWrapper}>
                <IconsApp.Tool />
              </div>
              <span className={styles.providerName}>
                {order.provider.businessName}
              </span>
            </div>

            {showExpandButton && (
              <div
                className={`${styles.arrowIcon} ${
                  isExpanded ? styles.arrowIconRotated : ""
                }`}
              >
                <IconsApp.DownArrow />
              </div>
            )}
          </div>
          <div className={styles.divider} />
        </>
      )}

      <div className={styles.cardBody}>
        <div className={styles.infoRow}>
          <span className={styles.orderNumber}>Orden #{order.id}</span>
          <span className={styles.dateText}>{formatDate(order.createdAt)}</span>
        </div>

        <div className={styles.infoRow}>
          <span
            className={
              order.status === "active"
                ? styles.badgeActive
                : order.status === "completed"
                  ? styles.badgeCompleted
                  : order.status === "payment_validation"
                    ? styles.badgePaymentPending
                    : styles.badgeCancelled
            }
          >
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
            {formatDeliveryTimeLabel(order.quote.deliveryTime)}
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
                  {item.warranty && item.warranty !== "" && (
                    <p className={styles.itemWarranty}>
                      <IconsApp.Shield width="12" height="12" /> {item.warranty}
                    </p>
                  )}
                </div>
                <div className={styles.itemPriceWrapper}>
                  <span className={styles.itemQuantity}>x{item.quantity}</span>
                  <span className={styles.itemUnitPrice}>
                    ${item.price.toFixed(0)} c/u
                  </span>
                  <span className={styles.itemPrice}>
                    ${item.subtotal.toFixed(0)}
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

          <h3 className={styles.sectionTitle}>Condiciones comerciales</h3>
          <div className={styles.conditionsList}>
            <div className={styles.conditionCard}>
              <div className={styles.condIconBox}><IconsApp.CreditCard /></div>
              <div className={styles.condText}>
                <div className={styles.paymentMethodSection}>
                  <small className={styles.condLabel}>Forma de pago</small>
                  <div className={styles.paymentChips}>
                    {order.conditions.paymentMethods.map((method) => (
                      <button
                        key={method}
                        className={`${styles.paymentChip} ${
                          selectedPaymentMethod === method ? styles.paymentChipSelected : ""
                        }`}
                        onClick={!isProvider ? () => onPaymentMethodSelect?.(method) : undefined}
                        type="button"
                        style={isProvider ? { cursor: "default" } : undefined}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.cardDivider} />

          <h3 className={styles.sectionTitle}>
            {isProvider ? "Información del cliente" : "Información de contacto"}
          </h3>
          <div className={styles.contactContainer}>
            {isProvider &&
            (order.client?.contact || order.customer?.contact) ? (
              <>
                <ContactRow
                  icon={
                    <IconsApp.Email color="#BEBEBE" width="24" height="24" />
                  }
                  label="Correo electrónico"
                  value={
                    order.customer?.contact?.email ||
                    order.client?.contact?.email ||
                    ""
                  }
                />
                <ContactRow
                  icon={<IconsApp.Phone />}
                  label="Teléfono"
                  value={
                    order.customer?.contact?.phone ||
                    order.client?.contact?.phone ||
                    ""
                  }
                />
                <ContactRow
                  icon={<IconsApp.Pin width="24" height="24" color="#BEBEBE" />}
                  label="Dirección"
                  value={
                    order.customer?.contact?.address ||
                    order.client?.contact?.address ||
                    ""
                  }
                />
              </>
            ) : (
              <>
                <ContactRow
                  icon={
                    <IconsApp.Email color="#BEBEBE" width="24" height="24" />
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
                  icon={<IconsApp.Pin width="24" height="24" color="#BEBEBE" />}
                  label="Dirección"
                  value={
                    order.provider.location
                      ? `${order.provider.location.name} — ${order.provider.location.municipality}, ${order.provider.location.parish}, ${order.provider.location.state}`
                      : order.provider.contact.address
                  }
                />
              </>
            )}
          </div>

          {onChatClick && (
            <button className={styles.btnChat} onClick={onChatClick}>
              <IconsApp.ChatBlue /> Chat con{" "}
              {isProvider
                ? order.customer?.fullName ||
                  order.customer?.username ||
                  order.client?.username ||
                  "Cliente"
                : order.provider.businessName}
            </button>
          )}
          {!isProvider && showNotifyPaymentButton && onNotifyPaymentClick && (
            <button className={styles.btnNotifyPayment} onClick={onNotifyPaymentClick}>
              <IconsApp.CreditCard /> Notificar pago
            </button>
          )}
          {isProvider && showCompleteCashButton && onCompleteCashClick && (
            <button className={styles.btnCompleteCash} onClick={onCompleteCashClick}>
              Completar orden (Efectivo)
            </button>
          )}
          {!isProvider && onCancelClick && showCancelButton && (
            <button className={styles.btnCancel} onClick={onCancelClick}>
              Cancelar orden
            </button>
          )}
          {showReviewButton && onReviewClick && (
            <button className={styles.btnReview} onClick={onReviewClick}>
              <IconsApp.StarFilled /> Calificar
            </button>
          )}
        </div>
      </div>
    </section>
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

export default OrderDetailCard;
