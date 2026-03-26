"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IconsApp } from "@/components/icons/Icons";
import { PriceCard } from "@/components/price-card/PriceCard";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import {
  getProviderQuotes,
  ProviderQuote,
} from "@/app/lib/api/provider/home/quote";
import styles from "./Quotes.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import { SkeletonRequestDetail } from "@/components/skeleton/SkeletonRequestDetail";

export default function AllVendorQuotesPage() {
  const { jwt } = useAuth();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [quotes, setQuotes] = useState<ProviderQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getProviderQuotes(jwt);
        if (res.ok) {
          setQuotes(res.data.quotes);
        }
      } catch (error) {
        console.error("Error loading quotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwt]);

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header
            title="Mis Cotizaciones"
            onBack={() => router.replace("/home/vendor")}
          />
          <div className={styles.content}>
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
        <Header
          title="Mis Cotizaciones"
          onBack={() => router.replace("/home/vendor")}
        />

        <div className={styles.content}>
          {quotes.length === 0 ? (
            <p className={styles.emptyText}>No has enviado cotizaciones aún.</p>
          ) : (
            quotes.map((quote) => {
              const quoteCodeShort = quote.quoteCode
                .split("-")
                .slice(2)
                .join("-");
              return (
                <PriceCard
                  key={quote.documentId}
                  id={quoteCodeShort}
                  date={new Date(quote.createdAt).toLocaleDateString("es-ES")}
                  workshop={quote.request.client.username}
                  amount={quote.priceTotal.toFixed(2)}
                  time={quote.deliveryTime}
                  items={quote.items.map((item) => ({
                    name: item.productName,
                    model: `${quote.request.vehicle.brand} ${quote.request.vehicle.model} ${quote.request.vehicle.year}`,
                    type: item.availability,
                  }))}
                  totalSolicitados={quote.request.items.length}
                  isProvider={true}
                  documentId={quote.documentId}
                  onViewQuote={(docId) =>
                    router.push(`/home/vendor/quotes/${docId}`)
                  }
                />
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
