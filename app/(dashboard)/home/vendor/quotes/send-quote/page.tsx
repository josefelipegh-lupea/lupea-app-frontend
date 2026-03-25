"use client";

import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "./NewQuote.module.css";

export default function NewQuotePage() {
  const { isExpanded } = useSidebar();

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <button className={styles.backButton}>
            <IconsApp.BackArrow />
            <span>Volver</span>
          </button>

          <div className={styles.topHeaderCard}>
            <div className={styles.headerLeft}>
              <button className={styles.backButton}>
                <IconsApp.BackArrow />
              </button>
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
                  <IconsApp.Document color="#f08400" />
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
                <div key={prod.id} className={styles.productItem}>
                  <div className={styles.productInfoWrapper}>
                    <div className={styles.gearIcon}>
                      <IconsApp.Gear />
                    </div>
                    <div>
                      <p className={styles.prodName}>{prod.name}</p>
                      <p className={styles.prodSub}>{prod.sub}</p>
                    </div>
                  </div>

                  <div className={styles.productFields}>
                    <div className={styles.fieldRow}>
                      <label>Cant.</label>
                      <span className={styles.cantValue}>{prod.cant}</span>
                    </div>
                    <div className={styles.fieldRow}>
                      <label>Precio Unit. ($)</label>
                      <input
                        type="text"
                        placeholder="0"
                        className={styles.smallInput}
                      />
                    </div>
                    <div className={styles.fieldRow}>
                      <label>Stock</label>
                      <div className={styles.selectWrapper}>
                        <select className={styles.smallSelect}>
                          <option>Seleccionar</option>
                        </select>
                        <IconsApp.DownArrow />
                      </div>
                    </div>
                    <div className={styles.fieldRow}>
                      <label>Tiempo Entrega</label>
                      <input
                        type="text"
                        placeholder="Ej: 2 Días"
                        className={styles.smallInput}
                      />
                    </div>
                    <div className={styles.fieldRow}>
                      <label>Garantía / OBS.</label>
                      <div className={styles.capsuleInputsRow}>
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
                  </div>

                  <div className={styles.photoCircle}>
                    <IconsApp.Camera />
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.commercialCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#f08400" />
                </div>
                <h3>Condiciones comerciales</h3>
              </div>

              <div className={styles.tableDivider}></div>

              <div className={styles.commercialGrid}>
                {/* Columna Izquierda: Pagos y Entrega */}
                <div className={styles.commercialCol}>
                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Formas de pago aceptadas
                    </label>
                    <div className={styles.pillContainer}>
                      <button className={styles.pillButton}>
                        Transferencia
                      </button>
                      <button className={styles.pillButton}>
                        Tarjeta crédito
                      </button>
                      <button
                        className={`${styles.pillButton} ${styles.active}`}
                      >
                        Crédito 30 días
                      </button>
                      <button className={styles.pillButton}>Efectivo</button>
                    </div>
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Métodos de entrega
                    </label>
                    <div className={styles.pillContainer}>
                      <button className={styles.pillButton}>
                        Retiro en tiendas
                      </button>
                      <button
                        className={`${styles.pillButton} ${styles.active}`}
                      >
                        Envío a domicilio
                      </button>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Tiempos, Fecha y Notas */}
                <div className={styles.commercialCol}>
                  <div className={styles.rowInputs}>
                    <div className={styles.inputSubGroup}>
                      <label>Tiempo entrega global</label>
                      <input
                        type="time"
                        className={styles.smallInput}
                        required
                      />
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
                        <IconsApp.Calendar />
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

            {/*Footer*/}
            <div className={styles.stickyFooterAction}>
              <div className={styles.footerLeft}>
                <div className={styles.subtotalGroup}>
                  <label>SUBTOTAL ESTIMADO</label>
                  <span className={styles.subtotalValue}>$0.00</span>
                </div>

                <div className={styles.dividerVertical}></div>

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
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}
