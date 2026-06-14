"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { IconsApp } from "@/components/icons/Icons";
import { PriceCard } from "@/components/price-card/PriceCard";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";
import { getMyRequests, QuoteRequest } from "@/app/lib/api/client/home/request";
import {
  getClientRequestQuotes,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import styles from "./Quotes.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";

interface QuoteWithRequest {
  request: QuoteRequest;
  featuredQuote: ClientQuote;
}

export default function AllQuotesPage() {
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [quotes, setQuotes] = useState<QuoteWithRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;

      try {
        setLoading(true);
        const res = await getMyRequests(jwt);
        if (res.ok) {
          const requestsWithQuotes = res.data.requests.filter(
            (r) => r.quotesReceived > 0
          );

          const data = await Promise.all(
            requestsWithQuotes.map(async (request) => {
              const quotesRes = await getClientRequestQuotes(
                jwt,
                request.documentId
              );
              if (quotesRes.ok && quotesRes.data.featuredQuote) {
                return {
                  request,
                  featuredQuote: quotesRes.data.featuredQuote,
                };
              }
              return null;
            })
          );

          setQuotes(data.filter((d): d is QuoteWithRequest => d !== null));
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
          <Header title="Cotizaciones" />
          <div className={styles.content}>
            <SkeletonComparison />
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
        <Header title="Cotizaciones" />
        <div className={styles.content}>
          {quotes.length === 0 ? (
            <p className={styles.emptyText}>No tienes cotizaciones todavía.</p>
          ) : (
            quotes.map((data) => {
              const quoteCodeShort = data.featuredQuote.quoteCode
                .split("-")
                .slice(2)
                .join("-");
              const hasOrders = data.featuredQuote.request.status === "ordered";
              return (
                <PriceCard
                  key={data.featuredQuote.documentId}
                  id={quoteCodeShort}
                  date={new Date(
                    data.featuredQuote.createdAt
                  ).toLocaleDateString("es-ES")}
                  workshop={data.featuredQuote.provider.businessName}
                  amount={data.featuredQuote.priceTotal.toFixed(2)}
                  time={data.featuredQuote.deliveryTime}
                  rating={data.featuredQuote.provider.rating}
                  reviewCount={data.featuredQuote.provider.reviewCount}
                  items={data.request.items.map((item) => ({
                    name: item.productName,
                    model: `${data.request.vehicle.brand} ${data.request.vehicle.model} ${data.request.vehicle.year}`,
                    type:
                      item.conditionPreferred === "no_importa"
                        ? "Cualquiera"
                        : item.conditionPreferred,
                  }))}
                  totalSolicitados={data.request.items.length}
                  documentId={data.request.documentId}
                  quoteDocumentId={data.featuredQuote.documentId}
                  hasOrders={hasOrders}
                  onViewQuote={(quoteDocId) =>
                    router.push(`/home/user/quotes/${quoteDocId}`)
                  }
                  onCompare={(docId) =>
                    router.push(`/home/user/request/${docId}/comparison`)
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
