"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { useKeyboardHeight } from "@/hooks/useKeyboardHeight";
import { isFeatureEnabled } from "@/app/lib/featureFlags";
import { getClientVehicles } from "@/app/lib/api/client/vehicle";
import { getClientLocations } from "@/app/lib/api/client/location";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import LupitaChatPanel from "@/components/lupita/LupitaChatPanel";
import styles from "./Lupita.module.css";

/**
 * Página de Lupita. A propósito es una ruta real (no un modal/overlay
 * `position:fixed` sobre el home) — misma arquitectura que
 * `app/(dashboard)/chat/user/[id]/page.tsx` (chat de mensajería
 * Aliado↔Cliente), incluyendo el manejo de teclado móvil vía
 * `useKeyboardHeight` sobre contenido en flujo normal de documento. Dos
 * intentos previos como overlay `fixed` fallaron en iOS Safari real.
 */
export default function LupitaPage() {
  const router = useRouter();
  const { jwt, profile, loginProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const keyboardHeight = useKeyboardHeight();

  // null = aún cargando; [] = vacío de verdad (distinción para Lupita)
  const [vehicles, setVehicles] = useState<
    { id: number; label: string }[] | null
  >(null);
  const [locations, setLocations] = useState<
    { id: number; label: string }[] | null
  >(null);

  // Defensa en profundidad: mismo gate que valida /api/lupita/route.ts
  // server-side. El home ya solo muestra el trigger a clientes habilitados;
  // esto cubre el acceso directo por URL de un cliente sin el flag.
  useEffect(() => {
    if (loginProfile && !isFeatureEnabled(loginProfile, "lupita")) {
      router.replace("/home/user");
    }
  }, [loginProfile, router]);

  // Datos para el context de Lupita (vehículos + direcciones del cliente).
  // Fallo → lista vacía, no rompe la página.
  useEffect(() => {
    if (!jwt) return;

    const loadContext = async () => {
      try {
        const res = await getClientVehicles(jwt);
        setVehicles(
          (res.data ?? []).map((vehicle) => ({
            id: vehicle.id,
            label: [vehicle.brand, vehicle.model, vehicle.year, vehicle.engine]
              .filter(Boolean)
              .join(" "),
          })),
        );
      } catch (error) {
        console.error("Error loading vehicles for Lupita:", error);
        setVehicles([]);
      }

      try {
        const res = await getClientLocations(jwt);
        setLocations(
          (res.data ?? []).map((location) => ({
            id: location.id,
            label: `${location.name} - ${location.state}, ${location.municipality}`,
          })),
        );
      } catch (error) {
        console.error("Error loading locations for Lupita:", error);
        setLocations([]);
      }
    };

    loadContext();
  }, [jwt]);

  const tokensAvailable = loginProfile?.tokensAvailable ?? 0;
  const tokensTotal = loginProfile?.tokensTotal ?? 0;
  const tokensNextRenewal = loginProfile?.tokensNextRenewal
    ? new Date(loginProfile.tokensNextRenewal).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : loginProfile?.tokensLastRenewal
      ? new Date(loginProfile.tokensLastRenewal).toLocaleDateString("es-ES", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
        style={keyboardHeight > 0 ? { paddingBottom: keyboardHeight } : undefined}
      >
        <main className={styles.mainContainer}>
          <LupitaChatPanel
            onClose={() => router.back()}
            context={{
              firstName:
                (profile as { firstName?: string } | null)?.firstName ?? "",
              // null mientras carga → LupitaChatPanel no manda arrays vacíos
              // prematuros; [] real = cliente sin vehículos/direcciones.
              vehicles,
              locations,
              saldo: {
                available: tokensAvailable,
                total: tokensTotal,
                nextRenewal: tokensNextRenewal,
              },
            }}
          />
        </main>
      </div>
    </PageAnimation>
  );
}
