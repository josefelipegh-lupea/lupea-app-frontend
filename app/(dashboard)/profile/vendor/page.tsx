"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VendorProfile.module.css";
import ToggleSwitch from "@/components/toggle-switch/ToggleSwitch";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ProviderProfile } from "@/app/lib/api/vendor/vendorProfile";

import MENU_CONFIG_VENDOR, {
  MenuItemConfig,
} from "@/app/utils/constants/vendor-profile-opcionts";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subLabel?: string;
  rightElement?: React.ReactNode;
  href?: string;
  hasNotification?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  subLabel,
  icon,
  rightElement,
  href,
  hasNotification,
}) => {
  const isStatusActive = subLabel === "Activada" || subLabel === "En revisión";

  const MenuItemContent = (
    <div className={styles.menuItem}>
      <div className={styles.menuItemLeft}>
        <span className={styles.iconWrapper}>{icon}</span>
        <div className={styles.textColumn}>
          <span className={styles.menuLabel}>{label}</span>
          {subLabel && (
            <span
              className={`${styles.menuSubLabel} ${
                isStatusActive ? styles.subLabelActive : ""
              }`}
            >
              {subLabel}
            </span>
          )}
        </div>
      </div>
      <div className={styles.menuItemRight}>
        {rightElement ? rightElement : <IconsApp.RightArrow />}
        {hasNotification && <span className={styles.pulseDot} />}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.menuLink}>
        {MenuItemContent}
      </Link>
    );
  }

  return MenuItemContent;
};

export default function VendorProfilePage() {
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const { isExpanded } = useSidebar();
  const { user, profile, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !profile) {
    return <div className={styles.pageWrapper}>Cargando perfil...</div>;
  }

  const vendorProfile = profile as ProviderProfile;
  const isInReview = profile.status === "in_review";
  const isIncomplete = profile.status === "incomplete";

  // LÓGICA DE FILTRADO DE MENÚ SEGÚN ESTADO
  const displayMenu = MENU_CONFIG_VENDOR.map((section) => {
    // 1. Si está en revisión, no mostramos ningún ítem de menú normal
    if (isInReview) {
      return { ...section, items: [] };
    }

    // 2. Si está incompleto, solo mostramos la opción de Onboarding
    if (isIncomplete) {
      if (section.id === "cuenta") {
        return {
          ...section,
          items: [
            {
              label: "Completar perfil",
              icon: IconsApp.Personal,
              href: "/profile/vendor/onboarding",
            } as MenuItemConfig,
          ],
        };
      }
      return { ...section, items: [] };
    }

    // 3. Si está activo (o cualquier otro estado), mostramos el menú completo
    return section;
  }).filter(
    (section) =>
      (section.items && section.items.length > 0) || section.id === "version"
  );

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "in_review":
        return styles.statusInReview;
      case "active":
        return styles.statusActive;
      default:
        return styles.statusDefault;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "in_review":
        return "En revisión";
      case "active":
        return "Verificado";
      case "incomplete":
        return "Incompleto";
      default:
        return status;
    }
  };

  const formatLupas = (amount: number) => {
    return new Intl.NumberFormat("de-DE").format(amount || 0);
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        <div className={styles.layoutContent}>
          <div className={styles.leftPanel}>
            <section className={styles.profileHeader}>
              <div className={styles.avatarCircle}>
                <Image
                  src="/provider.png"
                  alt={vendorProfile.businessName || "Negocio"}
                  width={90}
                  height={90}
                  className={styles.avatarImage}
                />
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.userName}>
                  {vendorProfile.businessName || "Tu Negocio"}
                </h1>
                <div className={styles.statusRow}>
                  <p className={styles.userTag}>@{user.username}</p>
                  <span
                    className={`${styles.statusBadge} ${getStatusBadgeClass(
                      profile.status || ""
                    )}`}
                  >
                    {getStatusLabel(profile.status || "")}
                  </span>
                </div>
              </div>
            </section>

            <section className={styles.lupasCard}>
              <div className={styles.lupasContent}>
                <p className={styles.lupasTitle}>MIS LUPAS</p>
                <div className={styles.lupasAmountContainer}>
                  <span className={styles.lupasValue}>
                    {formatLupas(vendorProfile.tokensAvailable || 0)}
                  </span>
                  <span className={styles.lupasLabel}>Disponibles</span>
                </div>
              </div>
              <button className={styles.arrowButton}>
                <IconsApp.RightArrow />
              </button>
            </section>
          </div>

          <nav className={styles.menuContainer}>
            {/* MENSAJE EXCLUSIVO PARA PERFIL EN REVISIÓN */}
            {isInReview && (
              <div className={styles.reviewStatusBanner}>
                <div className={styles.reviewIcon}>
                  <IconsApp.OrangeClock />
                </div>
                <h3>Perfil en revisión</h3>
                <p>
                  Estamos validando tus documentos y datos comerciales. Te
                  notificaremos pronto.
                </p>
              </div>
            )}

            {/* RENDERIZADO DINÁMICO DEL MENÚ */}
            {displayMenu.map((section) => (
              <div key={section.id} className={styles.sectionGroup}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <div className={styles.itemsWrapper}>
                  {section.items?.map((item: MenuItemConfig) => (
                    <MenuItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      hasNotification={item.label === "Completar perfil"}
                      subLabel={
                        item.label === "Notificaciones"
                          ? isNotifEnabled
                            ? "Activada"
                            : "Desactivada"
                          : undefined
                      }
                      icon={item.icon()}
                      rightElement={
                        item.isSwitch ? (
                          <ToggleSwitch
                            isOn={isNotifEnabled}
                            handleToggle={() =>
                              setIsNotifEnabled(!isNotifEnabled)
                            }
                          />
                        ) : undefined
                      }
                    />
                  ))}
                </div>
                {section.items && section.items.length > 0 && (
                  <hr className={styles.divider} />
                )}
              </div>
            ))}

            <div className={styles.logoutWrapper}>
              <button className={styles.logoutButton} onClick={handleLogout}>
                Cerrar sesión
              </button>
            </div>
          </nav>
        </div>
      </main>
    </div>
  );
}
