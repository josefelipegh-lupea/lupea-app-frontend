"use client";

import { useState } from "react";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "./NewQuote.module.css";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";
import { useRouter } from "next/navigation";

const PAYMENT_METHODS = [
  "Transferencia",
  "Tarjeta crédito",
  "Crédito 30 días",
  "Efectivo",
];

const DELIVERY_METHODS = ["Retiro en tiendas", "Envío a domicilio"];

export default function NewQuotePage() {
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const { isFooterVisible } = useFooterVisibility();
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<
    string[]
  >([]);

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  const toggleDeliveryMethod = (method: string) => {
    setSelectedDeliveryMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

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
          {/* Header de la solicitud */}
          <div className={styles.topHeaderCard}>
            <button className={styles.backButton}>
              <IconsApp.Back color="#000" />
            </button>

            <div className={styles.headerCenter}>
              <div className={styles.headerTitleRow}>
                <h1 className={styles.requestId}>Solicitud #88421</h1>
                <span className={styles.badgePending}>PENDIENTE</span>
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.infoItem}>
                  <IconsApp.Clock />
                  <span>24 Mar, 2026</span>
                </div>
                <div className={styles.infoItem}>
                  <IconsApp.User />
                  <span>Carlos Alberto Moncada</span>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}></div>
          </div>

          <div className={styles.content}>
            <div className={styles.subheaderRow}>
              <h2 className={styles.subTitle}>Mis vehículos</h2>
              <span className={styles.progressText}>
                0 de 2 productos completados
              </span>
            </div>

            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{ width: "0%" }}
              ></div>
            </div>

            <div className={styles.providerCard}>
              <div className={styles.cardHeaderTitle}>
                <IconsApp.Store />
                <h3>Información del proveedor</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.providerGrid}>
                <div className={styles.infoGroup}>
                  <label>Nombre comercial</label>
                  <p>AutoPro Center</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Ubicación</label>
                  <p>Maracaibo — Zulia</p>
                </div>
              </div>
            </div>

            <div className={styles.productsCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#F08400" />
                </div>
                <h3>Productos a cotizar</h3>
              </div>

              <div className={styles.divider}></div>

              {/* Header de la Tabla */}
              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>Producto / Detalle</span>
                <span className={styles.colCant}>Cant.</span>
                <span className={styles.colPrice}>Precio Unit. ($)</span>
                <span className={styles.colStock}>Stock</span>
                <span className={styles.colDelivery}>Tiempo Entrega</span>
                <span className={styles.colWarranty}>Garantía / OBS.</span>
                <span className={styles.colPhoto}>Foto</span>
              </div>

              {/* Filas de Productos */}
              {[
                {
                  id: 1,
                  name: "Filtro de aceite sintético",
                  sub: "Volkswagen Gzolf VII • OEM",
                  cant: 12,
                },
                {
                  id: 2,
                  name: "Kit Distribución",
                  sub: "Volkswagen Golf VII • OEM",
                  cant: "04",
                },
              ].map((prod) => (
                <div key={prod.id} className={styles.productRow}>
                  <div className={styles.colProduct}>
                    <div className={styles.productInfoWrapper}>
                      <div className={styles.gearIcon}>
                        <IconsApp.Gear />
                      </div>
                      <div className={styles.nameContent}>
                        <p className={styles.prodName}>{prod.name}</p>
                        <p className={styles.prodSub}>{prod.sub}</p>
                      </div>
                    </div>
                  </div>
                  <div className={styles.colCant}>
                    <span className={styles.cantValue}>{prod.cant}</span>
                  </div>
                  <div className={styles.colPrice}>
                    <input
                      type="text"
                      placeholder="0"
                      className={styles.smallInput}
                    />
                  </div>
                  <div className={styles.colStock}>
                    <div className={styles.selectWrapper}>
                      <select className={styles.smallSelect}>
                        <option>Seleccionar</option>
                      </select>
                      <IconsApp.DownArrow />
                    </div>
                  </div>
                  <div className={styles.colDelivery}>
                    <input
                      type="text"
                      placeholder="Ej: 2 Días"
                      className={styles.smallInput}
                    />
                  </div>
                  <div className={styles.colWarranty}>
                    <div className={styles.obsContainer}>
                      <input
                        type="text"
                        placeholder="Garantía"
                        className={styles.capsuleInput}
                      />
                      <input
                        type="text"
                        placeholder="Observaciones"
                        className={styles.capsuleInput}
                      />
                    </div>
                  </div>
                  <div className={styles.colPhoto}>
                    <div className={styles.photoCircle}>
                      <IconsApp.Camera />
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
                {/* Columna Izquierda: Pagos y Entrega */}
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
                            selectedPaymentMethods.includes(method)
                              ? styles.active
                              : ""
                          }`}
                          onClick={() => togglePaymentMethod(method)}
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
                      {DELIVERY_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`${styles.pillButton} ${
                            selectedDeliveryMethods.includes(method)
                              ? styles.active
                              : ""
                          }`}
                          onClick={() => toggleDeliveryMethod(method)}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Tiempos, Fecha y Notas */}
                <div className={styles.commercialCol}>
                  <div className={styles.rowInputs}>
                    <div className={styles.inputSubGroup}>
                      <label>Tiempo entrega global</label>
                      <div className={styles.inputIconWrapper}>
                        <input
                          type="time"
                          className={styles.smallInput}
                          required
                        />
                        {/* El navegador suele poner su propio icono, pero podemos estilizarlo */}
                      </div>
                    </div>

                    <div className={styles.inputSubGroup}>
                      <label>Vigencia cotización</label>
                      <div className={styles.dateInputWrapper}>
                        <input
                          type="date"
                          className={styles.smallInput}
                          min={new Date().toISOString().split("T")[0]}
                          required
                        />
                        <div className={styles.calendarIconPointer}>
                          <IconsApp.Calendar />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.inputSubGroup}
                    style={{ marginTop: "20px" }}
                  >
                    <label>Notas generales (opcional)</label>
                    <textarea
                      placeholder="Condiciones adicionales, restricciones..."
                      className={styles.textAreaField}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.stickyFooterAction}>
            <div className={styles.footerLeft}>
              <div className={styles.subtotalGroup}>
                <label>SUBTOTAL ESTIMADO</label>
                <span className={styles.subtotalValue}>$0.00</span>
              </div>

              <div className={styles.dividerVertical} />

              <div className={styles.warningBadge}>
                <IconsApp.Warning color="#F08400" width="16" height="16" />
                <span>Faltan 2 productos por cotizar</span>
              </div>
            </div>

            <div className={styles.footerRight}>
              <button className={styles.btnCancel}>Cancelar</button>
              <button className={styles.btnSave}>
                <IconsApp.Save />
                Guardar borrador
              </button>
              <button className={styles.btnSubmit}>
                Enviar cotización
                <IconsApp.Send />
              </button>
            </div>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
