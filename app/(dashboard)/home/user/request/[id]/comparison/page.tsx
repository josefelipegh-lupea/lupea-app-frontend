"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  getClientRequestComparison,
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

export default function ComparisonPage({ params }: PageProps) {
  const { id } = use(params);
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [comparisonData, setComparisonData] = useState<ComparisonQuote[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<number, Set<number>>>(
    new Map()
  );
  const [showInfoBox, setShowInfoBox] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // ... (Fetch y lógica de toggleItem/Totales se mantienen igual)
  useEffect(() => {
    const fetchComparison = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        const res = await getClientRequestComparison(jwt, id);
        if (res.ok) {
          const requestStatus = res.data.request.status;
          // if (requestStatus === "ordered") {
          //   toast.error("Esta cotización ya tiene una orden generada");
          //   router.push("/home/user");
          //   return;
          // }
          setComparisonData(res.data.quotes);
        }
      } catch (error) {
        console.error("Error loading comparison:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchComparison();
  }, [jwt, id, router]);

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
        .reduce((sum, p) => sum + p.price, 0) || 0
    );
  };

  const getTotalAmount = () => {
    let total = 0;
    selectedItems.forEach(
      (_, quoteId) => (total += getQuoteSelectedTotal(quoteId))
    );
    return total;
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
              <span>Solicitud {id.slice(0, 5)}</span>
              <IconsApp.DownArrow />
            </div>
            <span className={styles.quoteCount}>
              {comparisonData.length} Cotizaciones
            </span>
          </div>

          <div className={styles.searchFilterRow}>
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
            {comparisonData.map((quote) => {
              return (
                <div key={quote.id} className={styles.quoteCard}>
                  <div className={styles.cardHeader}>
                    <span>Solicitud {id.slice(0, 5)}</span>
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
                            : "4.9"}
                        </span>
                      </div>
                    </div>

                    <p className={styles.partsCount}>
                      {String(quote.products.length).padStart(2, "0")} de{" "}
                      {String(quote.products.length).padStart(2, "0")} Repuestos
                      solicitados
                    </p>

                    <div className={styles.partsList}>
                      {quote.products.map((product) => {
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
                                {product.brand} •{" "}
                                {product.availability || "Original"}
                              </p>
                            </div>
                            <span className={styles.partPrice}>
                              <span className={styles.quantity}>
                                x{product.quantity}
                              </span>
                              <span className={styles.unitPrice}>
                                ${product.price.toFixed(0)} c/u
                              </span>
                              <span className={styles.totalPrice}>
                                ${(product.price * product.quantity).toFixed(0)}
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
                          Hoy 2:00 PM
                        </span>
                      </span>
                      <div className={styles.cardTotal}>
                        Total ${getQuoteSelectedTotal(quote.id).toFixed(0)}
                      </div>
                    </div>

                    <div className={styles.buttonContainer}>
                      <Button
                        className={styles.btnAcceptCompleteOffer}
                        onClick={() => selectAllFromQuote(quote.id)}
                      >
                        Aceptar oferta completa
                      </Button>
                    </div>
                    <div className={styles.selectionSummary}>
                      <span>
                        {selectedItems.get(quote.id)?.size} Seleccionado
                      </span>
                      <span>${getQuoteSelectedTotal(quote.id).toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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
                0
              )}{" "}
              productos {selectedItems.size} proveedores
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
                {isGenerating ? "Generando..." : "Generar órdenes"}
              </Button>
            </div>
            <p className={styles.footerSub}>
              Se generará {selectedItems.size} ordenes de compra
            </p>
          </div>
        </div>
      </div>
    </PageAnimation>
  );
}
