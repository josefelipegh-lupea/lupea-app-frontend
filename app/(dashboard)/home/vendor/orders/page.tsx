"use client";

import { useRouter } from "next/navigation";
import { IconsApp } from "@/components/icons/Icons";
import { OrderCard } from "@/components/order-card/OrderCard";
import styles from "./Orders.module.css";
import Header from "@/components/header/Header";

interface Order {
  id: string;
  title: string;
  cantidadRepuestos: number;
  status: "ACTIVA" | "CANCELADA" | "COMPLETADA";
}

const mockOrders: Order[] = [
  {
    id: "88420",
    title: "Taller Mecánico 'El Rayo'",
    cantidadRepuestos: 7,
    status: "ACTIVA",
  },
  {
    id: "88421",
    title: "Servicio Autorizado Bosch",
    cantidadRepuestos: 3,
    status: "CANCELADA",
  },
  {
    id: "88422",
    title: "Frenos Santiago",
    cantidadRepuestos: 5,
    status: "COMPLETADA",
  },
];

export default function AllVendorOrdersPage() {
  const router = useRouter();

  return (
    <div className={styles.pageWrapper}>
      <Header title="Órdenes" />

      <div className={styles.content}>
        {mockOrders.length === 0 ? (
          <p className={styles.emptyText}>No tienes órdenes todavía.</p>
        ) : (
          mockOrders.map((order) => <OrderCard key={order.id} {...order} />)
        )}
      </div>
    </div>
  );
}
