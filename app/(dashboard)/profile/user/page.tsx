"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./UserProfile.module.css";
import ToggleSwitch from "@/components/toggle-switch/ToggleSwitch";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import MENU_CONFIG_USER from "@/app/utils/constants/user-profile-options";

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

  // 1. Definimos el contenido base para no repetirlo
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

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        {/* Contenedor flexible para Desktop */}
        <div className={styles.layoutContent}>
          {/* COLUMNA IZQUIERDA (Header + Card) */}
          <div className={styles.leftPanel}>
            <section className={styles.profileHeader}>
              <div className={styles.avatarContainer}>
                <div className={styles.avatarCircle}>
                  <Image
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Cristian Ramirez"
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
                <h1 className={styles.userName}>Cristian Ramirez</h1>
                <p className={styles.userTag}>@Cristian1739</p>
              </div>
            </section>

            <section className={styles.lupasCard}>
              <div className={styles.lupasContent}>
                <p className={styles.lupasTitle}>MIS LUPAS</p>
                <div className={styles.lupasAmountContainer}>
                  <span className={styles.lupasValue}>10.583</span>
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
          </nav>
        </div>
      </main>
    </div>
  );
}
