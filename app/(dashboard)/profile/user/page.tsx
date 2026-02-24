"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./UserProfile.module.css";
import ToggleSwitch from "@/components/toggle-switch/ToggleSwitch";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import MENU_CONFIG_USER from "@/app/utils/constants/user-profile-options";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ClientProfileResponse } from "@/app/lib/api/client/clientProfile";
import { updateNotification } from "@/app/lib/api/client/notification";
import toast from "react-hot-toast";

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

export default function UserProfilePage() {
  const [isNotifEnabled, setIsNotifEnabled] = useState(true);
  const { isExpanded } = useSidebar();
  const { user, profile, logout, isLoading, refreshProfile } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  const formatLupas = (amount: number) => {
    return new Intl.NumberFormat("de-DE").format(amount || 0);
  };

  const handleToggleSwitch = async (value: boolean) => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    try {
      await updateNotification(jwt, value);
      refreshProfile();
    } catch (error) {
      setIsNotifEnabled(!value);
      toast.error("Error al cambiar las preferencias de notificaciones");
    }
  };

  const clientProfile = profile as ClientProfileResponse;

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || !profile) {
    return <div className={styles.pageWrapper}>Cargando perfil...</div>;
  }

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
              <div className={styles.avatarContainer}>
                <div className={styles.avatarCircle}>
                  <Image
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt={clientProfile.displayName || "Usuario"}
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
                <h1 className={styles.userName}>{clientProfile.displayName}</h1>
                <p className={styles.userTag}>@{user.username}</p>
              </div>
            </section>

            <section className={styles.lupasCard}>
              <div className={styles.lupasContent}>
                <p className={styles.lupasTitle}>MIS LUPAS</p>
                <div className={styles.lupasAmountContainer}>
                  <span className={styles.lupasValue}>
                    {formatLupas(clientProfile.tokensAvailable)}
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
            {MENU_CONFIG_USER.map((section) => (
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
                            ? clientProfile.notificationsEnabled
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
                              isOn={clientProfile.notificationsEnabled}
                              handleToggle={() =>
                                handleToggleSwitch(
                                  !clientProfile.notificationsEnabled
                                )
                              }
                            />
                          ) : undefined
                        }
                      />
                    );
                  })}
                </div>
                <hr
                  className={`${styles.divider} ${
                    section.id === "version" ? styles.noDivider : ""
                  }`}
                />
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
