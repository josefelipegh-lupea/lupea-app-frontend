"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import styles from "./Quotes.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import {
  getClientRequestQuotes,
  ClientQuote,
} from "@/app/lib/api/client/home/quote";
import { PriceCard } from "@/components/price-card/PriceCard";
import { SkeletonComparison } from "@/components/skeleton/SkeletonComparison";

const RequestQuotesPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [quotes, setQuotes] = useState<ClientQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuotes = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getClientRequestQuotes(jwt, params.id as string);
        if (res.ok) {
          setQuotes(res.data.quotes);
        }
      } catch (error) {
        console.error("Error loading quotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [jwt, params.id]);

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header title="Ofertas" />
          <div className={styles.container}>
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
        <Header title="Ofertas" />

        <div className={styles.container}>
          <p className={styles.summaryText}>
            Ofertas disponibles para esta solicitud:
            <br />
            <strong>{quotes.length} Ofertas</strong>
          </p>

          {quotes.map((quote) => (
            <PriceCard
              key={quote.documentId}
              id={quote.quoteCode.split("-").slice(2).join("-")}
              date={new Date(quote.createdAt).toLocaleDateString("es-ES")}
              workshop={quote.provider.businessName}
              amount={quote.priceTotal.toFixed(2)}
              time={quote.deliveryTime}
              items={quote.items.map((item) => ({
                name: item.productName,
                model: item.offeredBrand || "",
                type: item.availableQuantity?.toString() || "-",
              }))}
              totalSolicitados={quote.items.length}
              documentId={params.id as string}
              quoteDocumentId={quote.documentId}
              onCompare={(docId) =>
                router.push(`/home/user/request/${docId}/comparison`)
              }
              onViewQuote={(quoteDocId) =>
                router.push(`/home/user/quotes/${quoteDocId}`)
              }
            />
          ))}

          {quotes.length === 0 && (
            <div className={styles.emptyState}>
              <p>No hay ofertas disponibles para esta solicitud</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default RequestQuotesPage;
