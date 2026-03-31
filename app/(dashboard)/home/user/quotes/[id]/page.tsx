"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./QuoteDetail.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";

import {
  getClientQuoteById,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import {
  createOrdersFromComparison,
  getQuoteOrder,
  SelectedItem,
} from "@/app/lib/api/client/home/order";
import { IconsApp } from "@/components/icons/Icons";
import Button from "@/components/button/Button";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";

const QuoteDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [quote, setQuote] = useState<ClientQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getClientQuoteById(jwt, params.id as string);
        if (res.ok) {
          setQuote(res.data);
          if (res.data.request.status === "ordered") {
            const orderRes = await getQuoteOrder(jwt, res.data.documentId);
            if (orderRes.ok && orderRes.data.order) {
              const orderedItemIds = new Set(
                orderRes.data.order.items.map((item) => item.quoteItemId),
              );
              setSelectedItems(orderedItemIds);
            }
          }
        }
      } catch (error) {
        console.error("Error loading quote:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [jwt, params.id]);

  const toggleItem = (productId: number) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (!quote) return;
    setSelectedItems(new Set(quote.items.map((item) => item.id)));
  };

  const getSelectedTotal = (): number => {
    if (!quote) return 0;
    return quote.items
      .filter((item) => selectedItems.has(item.id))
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  };

  const handleGenerateOrder = async () => {
    if (!jwt || !quote || selectedItems.size === 0) return;

    setIsGenerating(true);
    try {
      const selectedItemsList: SelectedItem[] = Array.from(selectedItems).map(
        (itemId) => ({
          quoteItemId: itemId,
        }),
      );

      const res = await createOrdersFromComparison(
        jwt,
        quote.request.documentId,
        selectedItemsList,
      );

      if (res.ok && res.data.orders.length > 0) {
        setOrderSuccess(true);
        toast.success("Orden generada con éxito");
        setTimeout(() => {
          router.push(`/home/user/orders/${res.data.orders[0].documentId}`);
        }, 1500);
      }
    } catch (error) {
      toast.error("Error al generar la orden. Intenta de nuevo.");
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
            <Header title="Detalle de Cotización" />
            <div className={styles.container}>
              <SkeletonComparison />
            </div>
          </main>
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
            <Header title="Detalle de Cotización" />
            <div className={styles.container}>
              <p className={styles.emptyText}>Cotización no encontrada</p>
            </div>
          </main>
        </div>
      </PageAnimation>
    );
  }

  const isOrdered = quote.request.status === "ordered";

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Detalle de Cotización" />

          {/* <div className={styles.requestSelectorRow}>
          <div className={styles.selectorItem}>
            <IconsApp.Document color="#A1A1A1" />
            <span>Solicitud {quote.request.documentId.slice(0, 5)}</span>
            <IconsApp.DownArrow />
          </div>
          <span className={styles.quoteCount}>
            1 Cotización
          </span>
        </div> */}

          {/* <div className={styles.searchFilterRow}>
          <div className={styles.searchLeft}>
            <IconsApp.Search color="#1a1a3d" />
            <div className={styles.searchBadge}>
              <span>Menor precio</span>
              <IconsApp.Close className={styles.closeSearch} />
            </div>
          </div>
          <div className={styles.filterIcon}>
            <IconsApp.History />
          </div>
        </div> */}

          {isOrdered && (
            <div className={styles.infoBox}>
              <div className={styles.infoIcon}>
                <IconsApp.Check color="#22c55e" />
              </div>
              <div className={styles.infoContent}>
                <p>Esta cotización ya tiene una orden generada.</p>
              </div>
            </div>
          )}

          <div className={styles.quotesList}>
            <div className={styles.quoteCard}>
              <div className={styles.cardHeader}>
                <span>Cotización {quote.quoteCode}</span>
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
                      {quote.provider.businessName}
                    </span>
                  </div>
                </div>

                <p className={styles.partsCount}>
                  {String(quote.items.length).padStart(2, "0")} de{" "}
                  {String(quote.items.length).padStart(2, "0")} Repuestos
                  solicitados
                </p>

                <div className={styles.partsList}>
                  {quote.items.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`${styles.partItem} ${
                          isSelected ? styles.itemActive : ""
                        }`}
                        onClick={() => !isOrdered && toggleItem(item.id)}
                      >
                        <div
                          className={`${styles.checkbox} ${
                            isSelected ? styles.checked : ""
                          }`}
                        >
                          {isSelected && <IconsApp.Check color="white" />}
                        </div>
                        <div className={styles.partContent}>
                          <p className={styles.partName}>{item.productName}</p>
                          <p className={styles.partSub}>
                            {item.offeredBrand || "Original"}
                          </p>
                        </div>
                        <span className={styles.partPrice}>
                          <span className={styles.quantity}>
                            x{item.quantity}
                          </span>
                          <span className={styles.unitPrice}>
                            ${item.unitPrice.toFixed(0)} c/u
                          </span>
                          <span className={styles.totalPrice}>
                            ${(item.unitPrice * item.quantity).toFixed(0)}
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.deliveryTime}>
                    <IconsApp.GreenClock />
                    <span
                      style={{
                        color: "#419700",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      {quote.deliveryTime}
                    </span>
                  </span>
                  <div className={styles.cardTotal}>
                    Total ${quote.priceTotal.toFixed(0)}
                  </div>
                </div>

                {!isOrdered && (
                  <>
                    <div className={styles.buttonContainer}>
                      <Button
                        className={styles.btnAcceptCompleteOffer}
                        onClick={selectAll}
                      >
                        Seleccionar todos
                      </Button>
                    </div>
                    <div className={styles.selectionSummary}>
                      <span>{selectedItems.size} Seleccionado</span>
                      <span>${getSelectedTotal().toFixed(0)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={styles.stickyFooter}>
            {orderSuccess && (
              <div className={styles.successMessage}>
                Órden generada correctamente
              </div>
            )}
            <p className={styles.footerCount}>
              {isOrdered
                ? `${quote.items.length} productos`
                : `${selectedItems.size} productos`}
            </p>
            <div className={styles.footerActionRow}>
              <div className={styles.totalFinal}>
                Total <strong>${quote.priceTotal.toFixed(0)}</strong>
              </div>
              {isOrdered ? (
                <Button
                  className={styles.btnGenerar}
                  onClick={() =>
                    router.push(`/home/user/orders/${quote.orderDocumentId}`)
                  }
                >
                  Ver orden
                </Button>
              ) : (
                <Button
                  className={styles.btnGenerar}
                  onClick={handleGenerateOrder}
                  disabled={isGenerating || selectedItems.size === 0}
                >
                  {isGenerating ? "Generando..." : "Generar orden"}
                </Button>
              )}
            </div>
            {!isOrdered && (
              <p className={styles.footerSub}>Se generará 1 orden de compra</p>
            )}
          </div>
        </main>
      </div>
    </PageAnimation>
  );
};

export default QuoteDetailPage;
