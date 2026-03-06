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

// IMPORTAMOS TU ARCHIVO Y TU INTERFAZ
import MENU_CONFIG_VENDOR, {
  MenuItemConfig,
} from "@/app/utils/constants/vendor-profile-opcionts";

interface MenuItemProps {
  icon: React.ReactNode;
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
  const isRestricted =
    profile.status === "incomplete" || profile.status === "under_review";

  const displayMenu = MENU_CONFIG_VENDOR.map((section) => {
    if (isRestricted) {
      if (section.id === "cuenta") {
        return {
          ...section,
          items: [
            {
              label:
                profile.status === "incomplete"
                  ? "Completar perfil"
                  : "Perfil en revisión",
              icon: IconsApp.Personal,
              href:
                profile.status === "incomplete"
                  ? "/profile/vendor/onboarding"
                  : undefined,
            } as MenuItemConfig,
          ],
        };
      }
      return { ...section, items: [] as MenuItemConfig[] };
    }
    return section;
  }).filter(
    (section) =>
      (section.items && section.items.length > 0) || section.id === "version"
  );

  const handleLogout = () => {
    logout();
    router.replace("/login");
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
                  src="https://randomuser.me/api/portraits/men/32.jpg"
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
                <p className={styles.userTag}>@{user.username}</p>
              </div>
            </section>
          </div>

          <nav className={styles.menuContainer}>
            {displayMenu.map((section) => (
              <div key={section.id} className={styles.sectionGroup}>
                <h2 className={styles.sectionTitle}>{section.title}</h2>
                <div className={styles.itemsWrapper}>
                  {section.items?.map((item: MenuItemConfig) => (
                    <MenuItem
                      key={item.label}
                      label={item.label}
                      href={item.href}
                      subLabel={
                        item.label === "Notificaciones"
                          ? isNotifEnabled
                            ? "Activada"
                            : "Desactivada"
                          : item.label === "Perfil en revisión"
                          ? "Validando datos"
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
