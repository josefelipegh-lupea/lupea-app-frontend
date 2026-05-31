import React from "react";
import { useRouter } from "next/navigation";

import styles from "./QuoteDetailCard.module.css";
import { IconsApp } from "../icons/Icons";
import { ClientQuote } from "@/app/lib/api/client/home/quote";

interface QuoteDetailCardProps {
  quote: ClientQuote;
  showActions?: boolean;
  isOrdered?: boolean;
  onGenerateOrder?: () => void;
  isGenerating?: boolean;
}

const QuoteDetailCard: React.FC<QuoteDetailCardProps> = ({
  quote,
  showActions = false,
  isOrdered = false,
  onGenerateOrder,
  isGenerating = false,
}) => {
  const router = useRouter();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return styles.badgeActive;
      case "accepted":
        return styles.badgeAccepted;
      case "rejected":
        return styles.badgeRejected;
      case "expired":
        return styles.badgeExpired;
      default:
        return styles.badgeActive;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activa";
      case "accepted":
        return "Aceptada";
      case "rejected":
        return "Rechazada";
      case "expired":
        return "Expirada";
      default:
        return status;
    }
  };

  return (
    <section className={styles.quoteCard}>
      <div className={styles.cardHeader}>
        <div className={styles.headerLeft}>
          <span className={styles.quoteCode}>{quote.quoteCode}</span>
          <span className={`${styles.badge} ${getStatusBadge(quote.status)}`}>
            {getStatusText(quote.status)}
          </span>
        </div>
        <span className={styles.dateText}>{formatDate(quote.createdAt)}</span>
      </div>

      <div className={styles.cardBody}>
        <div className={styles.providerSection}>
          <div className={styles.providerInfo}>
            <div className={styles.providerIcon}>
              <IconsApp.Tool />
            </div>
            <div className={styles.providerDetails}>
              <span className={styles.providerName}>
                {quote.provider.businessName}
              </span>
              <span className={styles.providerLocation}>
                {quote.provider.location.parish},{" "}
                {quote.provider.location.state}
              </span>
            </div>
          </div>
          <div className={styles.paymentMethods}>
            {quote.provider.paymentMethods?.map((method, idx) => (
              <span key={idx} className={styles.methodBadge}>
                {method}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.vehicleSection}>
          <div className={styles.vehicleIcon}>
            <IconsApp.Car />
          </div>
          <div className={styles.vehicleDetails}>
            <span className={styles.vehicleName}>
              {quote.request.vehicle.brand} {quote.request.vehicle.model}{" "}
              {quote.request.vehicle.year}
            </span>
            <span className={styles.vehicleVersion}>
              {quote.request.vehicle.engine}
            </span>
          </div>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.itemsSection}>
          <h4 className={styles.sectionTitle}>
            Repuestos cotizados ({quote.items.length})
          </h4>
          <div className={styles.itemsList}>
            {quote.items.map((item) => (
              <div key={item.documentId} className={styles.itemRow}>
                <div className={styles.itemMain}>
                  <div className={styles.itemIcon}>
                    <IconsApp.Gear />
                  </div>
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.productName}</p>
                    <p className={styles.itemSub}>
                      {item.offeredBrand} • {item.availableQuantity}
                    </p>
                  </div>
                </div>
                <div className={styles.itemPrice}>
                  <span className={styles.unitPrice}>
                    ${item.unitPrice.toFixed(2)}
                  </span>
                  <span className={styles.warrantyBadge}>
                    {item.warranty || "Sin garantía"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.cardDivider} />

        <div className={styles.summarySection}>
          <div className={styles.summaryRow}>
            <span className={styles.deliveryTime}>
              <IconsApp.OrangeClock />
              {quote.deliveryTime}
            </span>
            <span className={styles.totalText}>
              Total ${quote.priceTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {quote.provider.warrantyPolicy && (
          <div className={styles.warrantySection}>
            <IconsApp.Shield />
            <span>{quote.provider.warrantyPolicy}</span>
          </div>
        )}

        {quote.noteGeneral && (
          <div className={styles.noteSection}>
            <p className={styles.noteText}>{quote.noteGeneral}</p>
          </div>
        )}

        {showActions && !isOrdered && onGenerateOrder && (
          <div className={styles.actionsSection}>
            <button
              className={styles.btnAccept}
              onClick={onGenerateOrder}
              disabled={isGenerating}
            >
              {isGenerating ? "Generando..." : "Aceptar oferta completa"}
            </button>
          </div>
        )}

        {isOrdered && (
          <div className={styles.orderedBadge}>
            <IconsApp.Check />
            <span>Orden generada</span>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuoteDetailCard;
