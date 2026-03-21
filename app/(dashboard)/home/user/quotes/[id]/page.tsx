"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

import styles from "./QuoteDetail.module.css";
import Header from "@/components/header/Header";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import { getClientQuoteById, ClientQuote } from "@/app/lib/api/client/home/quote";
import {
  createOrdersFromComparison,
  SelectedItem,
} from "@/app/lib/api/client/home/order";
import { SkeletonOrders } from "@/components/skeleton/SkeletonOrders";
import QuoteDetailCard from "@/components/quote-detail-card/QuoteDetailCard";

const QuoteDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { jwt } = useAuth();
  const { isExpanded } = useSidebar();
  const [quote, setQuote] = useState<ClientQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      if (!jwt || !params.id) return;

      try {
        setLoading(true);
        const res = await getClientQuoteById(jwt, params.id as string);
        if (res.ok) {
          setQuote(res.data);
        }
      } catch (error) {
        console.error("Error loading quote:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [jwt, params.id]);

  if (loading) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <Header title="Detalle de Cotización" />
        <SkeletonOrders />
      </div>
    );
  }

  if (!quote) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <Header title="Detalle de Cotización" />
        <div className={styles.container}>
          <p className={styles.emptyText}>Cotización no encontrada</p>
        </div>
      </div>
    );
  }

  const isOrdered = quote.request.status === "ordered";

  const handleGenerateOrder = async () => {
    if (!jwt || !quote) return;

    setIsGenerating(true);
    try {
      const selectedItems: SelectedItem[] = quote.items.map((item) => ({
        quoteItemId: item.id,
      }));

      const res = await createOrdersFromComparison(
        jwt,
        quote.request.documentId,
        selectedItems
      );

      if (res.ok && res.data.orders.length > 0) {
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

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <Header title="Detalle de Cotización" />

      <main className={styles.container}>
        <QuoteDetailCard
          quote={quote}
          showActions={true}
          isOrdered={isOrdered}
          onGenerateOrder={handleGenerateOrder}
          isGenerating={isGenerating}
        />
      </main>
    </div>
  );
};

export default QuoteDetailPage;
