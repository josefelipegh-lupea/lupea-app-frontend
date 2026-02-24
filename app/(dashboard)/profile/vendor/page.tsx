"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./VendorProfile.module.css";
import ToggleSwitch from "@/components/toggle-switch/ToggleSwitch";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import MENU_CONFIG_VENDOR from "@/app/utils/constants/vendor-profile-opcionts";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ProviderProfile } from "@/app/lib/api/vendor/vendorProfile";

interface MenuItemProps {
  icon: string | React.ReactNode;
  label: string;
  subLabel?: string;
  rightElement?: React.ReactNode;
  href?: string;
}

const MenuItem: React.FC<MenuItemProps> = ({
  label,
  subLabel,
  icon,
  rightElement,
  href,
}) => {
  const isStatusActive = subLabel === "Activada";

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

  // Redirección si no hay usuario logueado
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !profile) {
    return (
      <div className={styles.pageWrapper}>Cargando perfil de proveedor...</div>
    );
  }

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Cast del perfil a tipo Proveedor
  const vendorProfile = profile as ProviderProfile;

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        <div className={styles.layoutContent}>
          {/* COLUMNA IZQUIERDA (Header + Card) */}
          <div className={styles.leftPanel}>
            <section className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarCircle}>
                  <Image
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt={vendorProfile.businessName}
                    width={90}
                    height={90}
                    className={styles.avatarImage}
                  />
                  <button className={styles.cameraButton}>
                    <IconsApp.Camera />
                  </button>
                </div>
              </div>
              <div className={styles.userInfo}>
                <h1 className={styles.userName}>
                  {vendorProfile.businessName || "Nombre del Negocio"}
                </h1>
                <p className={styles.userTag}>@{user.username}</p>
              </div>
            </section>

            <section className={styles.lupasCard}>
              <div className={styles.lupasContent}>
                <p className={styles.lupasTitle}>MIS LUPAS</p>
                <div className={styles.lupasAmountContainer}>
                  <span className={styles.lupasValue}>0</span>
                  <span className={styles.lupasLabel}>Disponibles</span>
                </div>
              </div>
              <button className={styles.arrowButton}>
                <IconsApp.RightArrow />
              </button>
            </section>
          </div>

          {/* COLUMNA DERECHA (Menú) */}
          <nav className={styles.menuContainer}>
            {MENU_CONFIG_VENDOR.map((section) => (
              <div key={section.id} className={styles.sectionGroup}>
                <h2
                  className={`${styles.sectionTitle} ${
                    section.id === "version" ? styles.versionTitle : ""
                  }`}
                >
                  {section.title}
                </h2>

                <div className={styles.itemsWrapper}>
                  {section.items?.map((item) => {
                    const isNotif = item.label === "Notificaciones";
                    return (
                      <MenuItem
                        key={item.label}
                        label={item.label}
                        href={item.href}
                        subLabel={
                          isNotif
                            ? isNotifEnabled
                              ? "Activada"
                              : "Desactivada"
                            : undefined
                        }
                        icon={
                          typeof item.icon === "function"
                            ? item.icon()
                            : item.icon
                        }
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
                    );
                  })}
                </div>
                <hr className={styles.divider} />
              </div>
            ))}

            {/* Botón de Logout para Proveedor */}
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
