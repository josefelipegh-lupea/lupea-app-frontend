"use client";

import { useEffect, useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  getClientRequestComparison,
  rejectQuote,
  ComparisonQuote,
} from "@/app/lib/api/client/home/comparison";
import {
  createOrdersFromComparison,
  SelectedItem,
} from "@/app/lib/api/client/home/order";
import { IconsApp } from "@/components/icons/Icons";
import Button from "@/components/button/Button";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import styles from "./Comparison.module.css";
import Header from "@/components/header/Header";
import toast from "react-hot-toast";

interface PageProps {
  params: Promise<{ id: string }>;
}

type SortFilter = "price_asc" | "price_desc" | "delivery_asc" | "reputation_desc" | null;

interface ActiveFilters {
  sort: SortFilter;
  withWarranty: boolean;
  requestItemId: number | null;
}

const SORT_LABELS: Record<NonNullable<SortFilter>, string> = {
  price_asc: "Menor precio",
  price_desc: "Mayor precio",
  delivery_asc: "Entrega rápida",
  reputation_desc: "Mejor reputación",
};

export default function ComparisonPage({ params }: PageProps) {
  const { id } = use(params);
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonQuote[]>([]);
  const [requestItemsCount, setRequestItemsCount] = useState(0);
  const [requestItems, setRequestItems] = useState<{ id: number; productName: string }[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<number, Set<number>>>(
    new Map(),
  );
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [customQuantities, setCustomQuantities] = useState<Map<string, number>>(
    new Map(),
  );
  const [confirmRejectId, setConfirmRejectId] = useState<string | null>(null);
  const [rejectingQuoteId, setRejectingQuoteId] = useState<string | null>(null);

  // Filter state
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sort: null,
    withWarranty: false,
    requestItemId: null,
  });

  useEffect(() => {
    const fetchComparison = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        const res = await getClientRequestComparison(jwt, id);
        if (res.ok) {
          setComparisonData(res.data.quotes);
          setRequestItemsCount(res.data.summary?.requestItemsCount ?? 0);
          setRequestItems(
            (res.data.request?.items ?? []).map((item: { id: number; productName: string }) => ({
              id: item.id,
              productName: item.productName,
            })),
          );
        }
      } catch (error) {
        console.error("Error loading comparison:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [jwt, id, router]);

  // ── Filtered + sorted data ──────────────────────────────────────────
  const filteredData = useMemo(() => {
    let data = [...comparisonData];

    // Filter: only quotes that have at least one product for the selected requestItem
    if (activeFilters.requestItemId !== null) {
      data = data.filter((q) =>
        q.products.some((p) => p.requestItemId === activeFilters.requestItemId),
      );
    }

    // Filter: only quotes where at least one product has warranty
    if (activeFilters.withWarranty) {
      data = data.filter((q) => q.products.some((p) => p.warranty));
    }

    // Sort
    if (activeFilters.sort === "price_asc") {
      data.sort((a, b) => a.quoteTotal - b.quoteTotal);
    } else if (activeFilters.sort === "price_desc") {
      data.sort((a, b) => b.quoteTotal - a.quoteTotal);
    } else if (activeFilters.sort === "delivery_asc") {
      data.sort(
        (a, b) => Number(a.deliveryTime ?? 9999) - Number(b.deliveryTime ?? 9999),
      );
    } else if (activeFilters.sort === "reputation_desc") {
      data.sort(
        (a, b) => (b.provider.reputationScore ?? 0) - (a.provider.reputationScore ?? 0),
      );
    }

    return data;
  }, [comparisonData, activeFilters]);

  // ── Active filter chips for display ────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (activeFilters.sort) {
      chips.push({ key: "sort", label: SORT_LABELS[activeFilters.sort] });
    }
    if (activeFilters.withWarranty) {
      chips.push({ key: "withWarranty", label: "Con garantía" });
    }
    if (activeFilters.requestItemId !== null) {
      const item = requestItems.find((i) => i.id === activeFilters.requestItemId);
      chips.push({ key: "requestItemId", label: item?.productName ?? "Producto" });
    }
    return chips;
  }, [activeFilters, requestItems]);

  const removeChip = (key: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      ...(key === "sort" ? { sort: null } : {}),
      ...(key === "withWarranty" ? { withWarranty: false } : {}),
      ...(key === "requestItemId" ? { requestItemId: null } : {}),
    }));
  };

  const applySort = (sort: SortFilter) => {
    setActiveFilters((prev) => ({
      ...prev,
      sort: prev.sort === sort ? null : sort,
    }));
  };

  const toggleWarranty = () => {
    setActiveFilters((prev) => ({ ...prev, withWarranty: !prev.withWarranty }));
  };

  const applyRequestItem = (itemId: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      requestItemId: prev.requestItemId === itemId ? null : itemId,
    }));
  };

  const clearAllFilters = () => {
    setActiveFilters({ sort: null, withWarranty: false, requestItemId: null });
  };

  // ── Selection helpers ───────────────────────────────────────────────
  const toggleItem = (quoteId: number, productId: number) => {
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      const quoteItems = new Set(newMap.get(quoteId) || []);
      if (quoteItems.has(productId)) quoteItems.delete(productId);
      else quoteItems.add(productId);

      if (quoteItems.size === 0) newMap.delete(quoteId);
      else newMap.set(quoteId, quoteItems);
      return newMap;
    });
  };

  const getEffectiveQty = (
    quoteId: number,
    productId: number,
    defaultQty: number,
  ): number => {
    const key = `${quoteId}_${productId}`;
    return customQuantities.get(key) ?? defaultQty;
  };

  const handleQuantityChange = (
    quoteId: number,
    productId: number,
    value: string,
  ) => {
    const num = parseInt(value);
    if (!value) {
      setCustomQuantities((prev) => {
        const m = new Map(prev);
        m.delete(`${quoteId}_${productId}`);
        return m;
      });
      return;
    }
    if (isNaN(num) || num < 1) return;
    setCustomQuantities((prev) => {
      const m = new Map(prev);
      m.set(`${quoteId}_${productId}`, num);
      return m;
    });
  };

  const selectAllFromQuote = (quoteId: number) => {
    const quote = comparisonData.find((q) => q.id === quoteId);
    if (!quote) return;
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(quoteId, new Set(quote.products.map((p) => p.id)));
      return newMap;
    });
  };

  const getQuoteSelectedTotal = (quoteId: number): number => {
    const selected = selectedItems.get(quoteId);
    if (!selected) return 0;
    const quote = comparisonData.find((q) => q.id === quoteId);
    return (
      quote?.products
        .filter((p) => selected.has(p.id))
        .reduce(
          (sum, p) =>
            sum + p.price * getEffectiveQty(quoteId, p.id, p.quantity),
          0,
        ) || 0
    );
  };

  const getTotalAmount = () => {
    let total = 0;
    selectedItems.forEach(
      (_, quoteId) => (total += getQuoteSelectedTotal(quoteId)),
    );
    return total;
  };

  const handleRejectQuote = async () => {
    if (!confirmRejectId || !jwt) return;
    setRejectingQuoteId(confirmRejectId);
    try {
      await rejectQuote(jwt, confirmRejectId);
      setComparisonData((prev) =>
        prev.filter((q) => q.documentId !== confirmRejectId),
      );
      toast.success("Cotización rechazada");
    } catch (error) {
      toast.error("Error al rechazar la cotización. Intenta de nuevo.");
    } finally {
      setRejectingQuoteId(null);
      setConfirmRejectId(null);
    }
  };

  const handleGenerateOrders = async () => {
    if (selectedItems.size === 0 || !jwt) return;

    setIsGenerating(true);
    try {
      const selectedItemsList: SelectedItem[] = [];
      selectedItems.forEach((productIds, quoteId) => {
        const quote = comparisonData.find((q) => q.id === quoteId);
        if (!quote) return;

        productIds.forEach((productId) => {
          const product = quote.products.find((p) => p.id === productId);
          if (product) {
            selectedItemsList.push({
              quoteItemId: product.id,
            });
          }
        });
      });

      const res = await createOrdersFromComparison(jwt, id, selectedItemsList);

      if (res.ok && res.data.orders.length > 0) {
        setOrderSuccess(true);
        toast.success("Orden generada con éxito");
        setTimeout(() => {
          router.push(`/home/user/orders/${res.data.orders[0].documentId}`);
        }, 1500);
      }
    } catch (error) {
      toast.error("Error al generar las órdenes. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
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
          <main className={styles.mainContainer}>
            <Header title="Comparar cotizaciones" />
            <div className={styles.container}>
              <SkeletonComparison />
            </div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <div className={styles.mainContainer}>
          <Header title="Comparar cotizaciones" />

          <div className={styles.requestSelectorRow}>
            <div className={styles.selectorItem}>
              <IconsApp.Document color="#A1A1A1" />
              <span>Consulta {id.slice(0, 5)}</span>
              <IconsApp.DownArrow />
            </div>
            <span className={styles.quoteCount}>
              {comparisonData.length} Cotizaciones
            </span>
          </div>

          {/* ── Filter bar ── */}
          <div className={styles.searchFilterRow}>
            <div className={styles.searchLeft}>
              <IconsApp.Search color="#1a1a3d" />
              {activeChips.length === 0 ? (
                <span className={styles.filterPlaceholder}>Filtrar cotizaciones</span>
              ) : (
                <div className={styles.chipsRow}>
                  {activeChips.map((chip) => (
                    <div key={chip.key} className={styles.searchBadge}>
                      <span>{chip.label}</span>
                      <button
                        className={styles.closeSearch}
                        onClick={() => removeChip(chip.key)}
                        aria-label={`Quitar filtro ${chip.label}`}
                      >
                        <IconsApp.Close />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              className={`${styles.filterIconBtn} ${activeChips.length > 0 ? styles.filterIconActive : ""}`}
              onClick={() => setShowFilterSheet(true)}
              aria-label="Abrir filtros"
            >
              <IconsApp.Filter color={activeChips.length > 0 ? "#f08100" : "#1a1a3d"} />
              {activeChips.length > 0 && (
                <span className={styles.filterBadgeCount}>{activeChips.length}</span>
              )}
            </button>
          </div>

          {showInfoBox && (
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>
                <IconsApp.Warning width="50" height="50" />
              </div>
              <div className={styles.infoContent}>
                <p>
                  Busca y selecciona repuestos que deseas comprar. Puedes
                  combinar productos de diferentes proveedores.
                </p>
              </div>
              <button
                className={styles.closeInfo}
                onClick={() => setShowInfoBox(false)}
              >
                <IconsApp.Close />
              </button>
            </div>
          )}

          <div className={styles.quotesList}>
            {filteredData.length === 0 ? (
              <p className={styles.emptyFiltered}>
                No hay cotizaciones que coincidan con los filtros seleccionados.
              </p>
            ) : (
              filteredData.map((quote) => {
                // When filtering by requestItem, only show matching products
                const visibleProducts =
                  activeFilters.requestItemId !== null
                    ? quote.products.filter(
                        (p) => p.requestItemId === activeFilters.requestItemId,
                      )
                    : quote.products;

                return (
                  <div key={quote.id} className={styles.quoteCard}>
                    <div className={styles.cardHeader}>
                      <span>Consulta {id.slice(0, 5)}</span>
                      <span>
                        {new Date(quote.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <div className={styles.providerRow}>
                        <div className={styles.providerInfo}>
                          <div className={styles.toolIcon}>
                            <IconsApp.Clock />
                          </div>
                          <span className={styles.providerName}>
                            {quote.provider.name}
                          </span>
                        </div>
                        <div className={styles.ratingBadge}>
                          <IconsApp.StarFilled color="#F08100" />
                          <span>
                            {quote.provider.rating
                              ? quote.provider.rating.toFixed(1)
                              : "N/A"}
                          </span>
                        </div>
                      </div>

                      <p className={styles.partsCount}>
                        {String(visibleProducts.length).padStart(2, "0")} de{" "}
                        {String(requestItemsCount || quote.products.length).padStart(2, "0")} Repuestos
                        solicitados
                      </p>

                      <div className={styles.partsList}>
                        {visibleProducts.map((product) => {
                          const isSelected = selectedItems
                            .get(quote.id)
                            ?.has(product.id);
                          return (
                            <div
                              key={product.id}
                              className={`${styles.partItem} ${
                                isSelected ? styles.itemActive : ""
                              }`}
                              onClick={() => toggleItem(quote.id, product.id)}
                            >
                              <div
                                className={`${styles.checkbox} ${
                                  isSelected ? styles.checked : ""
                                }`}
                              >
                                {isSelected && <IconsApp.Check color="white" />}
                              </div>
                              <div className={styles.partContent}>
                                <p className={styles.partName}>
                                  {product.productName}
                                </p>
                                <p className={styles.partSub}>
                                  · {product.brand || product.availability || "Original"}
                                </p>
                                {product.notes && (
                                  <p className={styles.partNotes}>
                                    {product.notes}
                                  </p>
                                )}
                              </div>
                              <span className={styles.partPrice}>
                                <span className={styles.quantity}>
                                  {isSelected ? (
                                    <input
                                      type="number"
                                      min="1"
                                      className={styles.quantityInput}
                                      value={getEffectiveQty(
                                        quote.id,
                                        product.id,
                                        product.quantity,
                                      )}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleQuantityChange(
                                          quote.id,
                                          product.id,
                                          e.target.value,
                                        )
                                      }
                                    />
                                  ) : (
                                    `x${product.quantity}`
                                  )}
                                </span>
                                <span className={styles.unitPrice}>
                                  ${product.price.toFixed(0)} c/u
                                </span>
                                <span className={styles.totalPrice}>
                                  $
                                  {(
                                    product.price *
                                    getEffectiveQty(
                                      quote.id,
                                      product.id,
                                      product.quantity,
                                    )
                                  ).toFixed(0)}
                                </span>
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className={styles.cardFooter}>
                        <span className={styles.deliveryTime}>
                          <IconsApp.GreenClock />
                          <span className={styles.deliveryTimeText}>
                            {quote.deliveryTime
                              ? `Entrega: ${quote.deliveryTime}`
                              : "Entrega: a convenir"}
                          </span>
                        </span>
                        <div className={styles.cardTotal}>
                          Total ${getQuoteSelectedTotal(quote.id).toFixed(0)}
                        </div>
                      </div>

                      <div className={styles.buttonContainer}>
                        <button
                          className={styles.btnAcceptCompleteOffer}
                          onClick={() => selectAllFromQuote(quote.id)}
                        >
                          Aceptar oferta completa
                        </button>
                        <button
                          className={styles.btnReject}
                          onClick={() => setConfirmRejectId(quote.documentId)}
                        >
                          Rechazar
                        </button>
                      </div>
                      <div className={styles.selectionSummary}>
                        <span>
                          {selectedItems.get(quote.id)?.size ?? 0} Seleccionado/s
                        </span>
                        <span>${getQuoteSelectedTotal(quote.id).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className={styles.stickyFooter}>
            {orderSuccess && (
              <div className={styles.successMessage}>
                Órdenes generadas correctamente
              </div>
            )}
            <p className={styles.footerCount}>
              {Array.from(selectedItems.values()).reduce(
                (a, b) => a + b.size,
                0,
              )}{" "}
              producto/s de {selectedItems.size} proveedor/es
            </p>
            <div className={styles.footerActionRow}>
              <div className={styles.totalFinal}>
                Total <strong>${getTotalAmount().toFixed(0)}</strong>
              </div>
              <Button
                className={styles.btnGenerar}
                onClick={handleGenerateOrders}
                disabled={isGenerating || selectedItems.size === 0}
              >
                {isGenerating ? "Generando..." : "Comprar"}
              </Button>
            </div>
            <p className={styles.footerSub}>
              Se generarán {selectedItems.size} órdenes de compra
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter bottom sheet ── */}
      {showFilterSheet && (
        <div
          className={styles.sheetOverlay}
          onClick={() => setShowFilterSheet(false)}
        >
          <div
            className={styles.filterSheet}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.sheetBody}>
              <div className={styles.sheetHeader}>
                <span className={styles.sheetTitle}>Filtros</span>
                {activeChips.length > 0 && (
                  <button className={styles.clearAllBtn} onClick={clearAllFilters}>
                    Limpiar todo
                  </button>
                )}
              </div>

              {/* Sort section */}
              <div className={styles.sheetSection}>
                <p className={styles.sheetSectionTitle}>Ordenar por</p>
                <div className={styles.sheetOptions}>
                  {(Object.entries(SORT_LABELS) as [NonNullable<SortFilter>, string][]).map(
                    ([key, label]) => (
                      <button
                        key={key}
                        className={`${styles.sheetOption} ${
                          activeFilters.sort === key ? styles.sheetOptionActive : ""
                        }`}
                        onClick={() => applySort(key)}
                      >
                        {label}
                        {activeFilters.sort === key && (
                          <IconsApp.Check color="#f08100" />
                        )}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Warranty filter */}
              <div className={styles.sheetSection}>
                <p className={styles.sheetSectionTitle}>Características</p>
                <button
                  className={`${styles.sheetOption} ${
                    activeFilters.withWarranty ? styles.sheetOptionActive : ""
                  }`}
                  onClick={toggleWarranty}
                >
                  Con garantía
                  {activeFilters.withWarranty && (
                    <IconsApp.Check color="#f08100" />
                  )}
                </button>
              </div>

              {/* Filter by requested product (only if more than 1) */}
              {requestItems.length > 1 && (
                <div className={styles.sheetSection}>
                  <p className={styles.sheetSectionTitle}>Producto solicitado</p>
                  <div className={styles.sheetOptions}>
                    {requestItems.map((item) => (
                      <button
                        key={item.id}
                        className={`${styles.sheetOption} ${
                          activeFilters.requestItemId === item.id
                            ? styles.sheetOptionActive
                            : ""
                        }`}
                        onClick={() => applyRequestItem(item.id)}
                      >
                        {item.productName}
                        {activeFilters.requestItemId === item.id && (
                          <IconsApp.Check color="#f08100" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              className={styles.sheetApplyBtn}
              onClick={() => setShowFilterSheet(false)}
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      {confirmRejectId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalTitle}>¿Rechazar cotización?</p>
            <p className={styles.modalBody}>
              Esta acción no se puede deshacer. El proveedor será notificado.
            </p>
            <div className={styles.modalActions}>
              <button
                className={styles.modalBtnCancel}
                onClick={() => setConfirmRejectId(null)}
                disabled={!!rejectingQuoteId}
              >
                Cancelar
              </button>
              <button
                className={styles.modalBtnConfirm}
                onClick={handleRejectQuote}
                disabled={!!rejectingQuoteId}
              >
                {rejectingQuoteId ? "Rechazando..." : "Confirmar rechazo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageAnimation>
  );
}
