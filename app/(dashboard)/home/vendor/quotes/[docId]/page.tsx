"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "../send-quote/NewQuote.module.css";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";
import { useAuth } from "@/context/AuthContext";
import {
  getQuoteDetail,
  QuoteDetailResponse,
} from "@/app/lib/api/provider/home/quote";
import { SkeletonSendQuote } from "@/components/skeleton/SkeletonSendQuote";

const PAYMENT_METHODS = [
  "Zelle",
  "Pago Móvil",
  "Efectivo",
  "Transferencia",
  "Binance",
];

const DELIVERY_METHODS = ["Retiro en tienda", "Envío local", "Envío nacional"];

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const { jwt } = useAuth();
  const { isFooterVisible } = useFooterVisibility();

  const docId = params.docId as string;

  const [quote, setQuote] = useState<QuoteDetailResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt || !docId) return;

      try {
        setLoading(true);
        const res = await getQuoteDetail(jwt, docId, true);
        if (res.ok) {
          setQuote(res.data);
        }
      } catch (error) {
        console.error("Error cargando detalle de cotización:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwt, docId]);

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "sent":
      case "viewed":
      case "accepted":
        return styles.badgeSent;
      case "rejected":
        return styles.badgeRejected;
      case "expired":
        return styles.badgeExpired;
      default:
        return styles.badgePending;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviada";
      case "viewed":
        return "Vista";
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

  const getDeliveryMethodLabel = (method: string) => {
    switch (method) {
      case "store_pickup":
        return "Retiro en tienda";
      case "local_delivery":
        return "Envío local";
      case "national_delivery":
        return "Envío nacional";
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <div className={styles.mainContainer}>
            <div className={styles.content}>
              <SkeletonSendQuote />
            </div>
          </div>
        </div>
      </PageAnimation>
    );
  }

  if (!quote) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <main className={styles.mainContainer}>
            <div className={styles.topHeaderCard}>
              <button
                className={styles.backButton}
                onClick={() => router.back()}
              >
                <IconsApp.Back color="#000" />
              </button>
              <div className={styles.headerCenter}>
                <h1>Cotización no encontrada</h1>
              </div>
            </div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  const vehicleInfo = `${quote.request.vehicle.brand} ${quote.request.vehicle.model} ${quote.request.vehicle.year}`;

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main
          className={`${styles.mainContainer} ${
            !isFooterVisible ? styles.noFooter : ""
          }`}
        >
          <div className={styles.topHeaderCard}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <IconsApp.Back color="#000" />
            </button>

            <div className={styles.headerCenter}>
              <div className={styles.headerTitleRow}>
                <h1 className={styles.requestId}>{quote.quoteCode}</h1>
                <span className={getStatusBadgeClass(quote.status)}>
                  {getStatusLabel(quote.status)}
                </span>
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.infoItem}>
                  <IconsApp.Clock />
                  <span>
                    {new Date(quote.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <IconsApp.User />
                  <span>@{quote.request.client.username}</span>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}></div>
          </div>

          <div className={styles.content}>
            <div className={styles.subheaderRow}>
              <h2 className={styles.subTitle}>{vehicleInfo}</h2>
              <span className={styles.progressText}>
                {quote.items.length} de {quote.request.items.length} productos
                cotizados
              </span>
            </div>

            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${
                    (quote.items.length / quote.request.items.length) * 100
                  }%`,
                }}
              ></div>
            </div>

            <div className={styles.providerCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.User color="#F08400" />
                </div>
                <h3>Información del cliente</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.providerGrid}>
                <div className={styles.infoGroup}>
                  <label>Nombre Completo</label>
                  <p>{quote.formContext?.requestHeader.clientName || "-"}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Ubicación</label>
                  <p>
                    {quote.request.location.parish},{" "}
                    {quote.request.location.municipality},{" "}
                    {quote.request.location.state}
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.productsCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#F08400" />
                </div>
                <h3>Productos cotizados</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>Producto / Detalle</span>
                <span className={styles.colCant}>Cant.</span>
                <span className={styles.colPrice}>Precio Unit. ($)</span>
                <span className={styles.colStock}>Disp.</span>
                <span className={styles.colWarranty}>Garantía / OBS.</span>
                <span className={styles.colPhoto}>Foto</span>
              </div>

              {quote.items.map((item, index) => (
                <div key={index} className={styles.productRow}>
                  <div
                    className={styles.colProduct}
                    data-label="Producto / Detalle"
                  >
                    <div className={styles.productInfoWrapper}>
                      <div className={styles.gearIcon}>
                        <IconsApp.Gear />
                      </div>
                      <div className={styles.nameContent}>
                        <p className={styles.prodName}>{item.productName}</p>
                        <p className={styles.prodSub}>
                          {quote.request.vehicle.brand}{" "}
                          {quote.request.vehicle.model}{" "}
                          {quote.request.vehicle.year} •{" "}
                          {item.requestItem.conditionPreferred === "no_importa"
                            ? "Cualquiera"
                            : item.requestItem.conditionPreferred}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.quickFields}>
                    <div className={styles.colCant} data-label="Cant.">
                      <span className={styles.cantValue}>{item.quantity}</span>
                    </div>
                    <div className={styles.colPrice} data-label="Precio ($)">
                      {item.unitPrice ? (
                        <input
                          type="text"
                          className={styles.smallInput}
                          value={`$${item.unitPrice.toFixed(2)}`}
                          disabled
                        />
                      ) : (
                        <span className={styles.placeholderValue}>-</span>
                      )}
                    </div>
                    <div
                      className={styles.colStock}
                      data-label="Disponibilidad"
                    >
                      {item.availableQuantity ? (
                        <input
                          type="text"
                          className={styles.smallInput}
                          value={item.availableQuantity.toString()}
                          disabled
                        />
                      ) : (
                        <span className={styles.placeholderValue}>-</span>
                      )}
                    </div>
                  </div>

                  <div
                    className={styles.colWarranty}
                    data-label="Garantía / OBS"
                  >
                    <div className={styles.obsContainer}>
                      <input
                        type="text"
                        className={styles.capsuleInput}
                        value={item.warranty || "-"}
                        disabled
                      />

                      <input
                        type="text"
                        className={styles.capsuleInput}
                        value={item.notes || "-"}
                        disabled
                      />
                    </div>
                  </div>
                  <div className={styles.colPhoto} data-label="Foto">
                    <div className={styles.photoCircle}>
                      {item.photo ? (
                        <img src={item.photo} alt={item.productName} />
                      ) : (
                        <IconsApp.Camera />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commercialCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#F08400" />
                </div>
                <h3>Condiciones comerciales</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.commercialGrid}>
                <div className={styles.commercialCol}>
                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Formas de pago aceptadas
                    </label>
                    <div className={styles.pillContainer}>
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`${styles.pillButton} ${
                            quote.provider.paymentMethods?.includes(method)
                              ? styles.active
                              : ""
                          }`}
                          disabled
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Métodos de entrega
                    </label>
                    <div className={styles.pillContainer}>
                      {quote.formContext?.commercialDefaults.hasStorePickup && (
                        <button
                          type="button"
                          className={`${styles.pillButton} ${styles.active}`}
                          disabled
                        >
                          Retiro en tienda
                        </button>
                      )}
                      {quote.formContext?.commercialDefaults
                        .hasLocalDelivery && (
                        <button
                          type="button"
                          className={`${styles.pillButton} ${styles.active}`}
                          disabled
                        >
                          Envío local
                        </button>
                      )}
                      {quote.formContext?.commercialDefaults
                        .hasNationalDelivery && (
                        <button
                          type="button"
                          className={`${styles.pillButton} ${styles.active}`}
                          disabled
                        >
                          Envío nacional
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.commercialCol}>
                  <div className={styles.rowInputs}>
                    <div className={styles.inputSubGroup}>
                      <label>Tiempo entrega estimado</label>
                      <div className={styles.inputIconWrapper}>
                        <span className={styles.readOnlyValue}>
                          {quote.deliveryTime || "-"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.inputSubGroup}>
                      <label>Vigencia cotización</label>
                      <div className={styles.dateInputWrapper}>
                        <span className={styles.readOnlyValue}>
                          {quote.validityDate
                            ? new Date(quote.validityDate).toLocaleDateString(
                                "es-ES",
                              )
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.inputSubGroup}
                    style={{ marginTop: "20px" }}
                  >
                    <label>Notas generales</label>
                    <p className={styles.notesText}>
                      {quote.noteGeneral || "Sin notas adicionales"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.stickyFooterAction}>
            <div className={styles.footerLeft}>
              <div className={styles.subtotalGroup}>
                <label>TOTAL COTIZACIÓN</label>
                <span className={styles.subtotalValue}>
                  ${quote.priceTotal.toFixed(2)}
                </span>
              </div>

              <div className={styles.dividerVertical} />

              <div
                className={`${styles.warningBadge} ${styles.warningBadgeSuccess}`}
              >
                <IconsApp.Check color="#22c55e" width="16" height="16" />
                <span className={styles.successText}>
                  Cotización {getStatusLabel(quote.status)}
                </span>
              </div>
            </div>

            <div className={styles.footerRight}></div>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
