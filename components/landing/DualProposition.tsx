"use client";

import Link from "next/link";
import { getIconComponent } from "@/lib/lucide-icon-map";

interface Bullet {
  icon: string;
  text: string;
}

interface ValueProp {
  badge?: string;
  title: string;
  theme: "buyer" | "pro";
  bullets: Bullet[];
  cta?: { label: string; url: string; external?: boolean };
}

const DEFAULT_VALUE_PROPS: ValueProp[] = [
  {
    badge: "PARA COMPRADORES",
    title: "Compre con confianza",
    theme: "buyer",
    bullets: [
      {
        icon: "BadgeCheck",
        text: "Garantía de compatibilidad total",
      },
      {
        icon: "BadgeCheck",
        text: "Pagos seguros y protegidos",
      },
      {
        icon: "BadgeCheck",
        text: "Soporte técnico especializado",
      },
    ],
    cta: {
      label: "Buscar Repuestos",
      url: "/user/register",
      external: false,
    },
  },
  {
    badge: "LUPEA PRO",
    title: "Venda más y mejor",
    theme: "pro",
    bullets: [
      {
        icon: "TrendingUp",
        text: "Acceso a miles de pedidos mensuales",
      },
      {
        icon: "TrendingUp",
        text: "Gestión de inventario inteligente",
      },
      {
        icon: "TrendingUp",
        text: "Reportes de mercado en tiempo real",
      },
    ],
    cta: {
      label: "Unirse como Proveedor",
      url: "/vendor/register",
      external: false,
    },
  },
];

export const DualProposition = ({ data }: { data?: ValueProp[] }) => {
  const valueProps = data || DEFAULT_VALUE_PROPS;

  return (
    <section id="benefits" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          {valueProps.map((prop, idx) => {
            const isBuyer = prop.theme === "buyer";
            const bgColor = isBuyer ? "bg-primary-container" : "bg-tertiary-container";
            const badgeBg = isBuyer ? "bg-secondary-container" : "bg-on-tertiary-container";
            const badgeText = isBuyer ? "text-on-secondary-container" : "text-white";
            const bulletIcon = isBuyer ? "text-secondary-container" : "text-on-tertiary-container";
            const ctaHover = isBuyer
              ? "hover:bg-secondary-container hover:text-on-secondary-container"
              : "hover:bg-white hover:text-primary";
            const iconName = isBuyer ? "ShoppingCart" : "Store";

            return (
              <div
                key={idx}
                className={`flex-1 relative p-12 ${bgColor} rounded-3xl text-white overflow-hidden`}
              >
                <div className="relative z-10">
                  <span
                    className={`inline-block px-3 py-1 ${badgeBg} ${badgeText} rounded-lg font-label-bold text-[10px] uppercase mb-4`}
                  >
                    {prop.badge}
                  </span>
                  <h2 className="font-display-lg text-3xl mb-4">
                    {prop.title}
                  </h2>
                  <ul className="space-y-4 mb-8">
                    {prop.bullets.map((bullet, bidx) => {
                      const BulletIcon = getIconComponent(bullet.icon);
                      return (
                        <li key={bidx} className="flex items-center gap-3">
                          {BulletIcon && (
                            <BulletIcon
                              size={20}
                              className={`${bulletIcon} flex-shrink-0`}
                            />
                          )}
                          <span className="font-body-md">{bullet.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                  {prop.cta && (
                    <Link
                      href={prop.cta.url}
                      className={`bg-white text-primary font-label-bold uppercase py-4 px-8 rounded-full transition-all inline-block ${ctaHover}`}
                    >
                      {prop.cta.label}
                    </Link>
                  )}
                </div>
                {/* Decorative icon */}
                <div className="absolute -right-10 -bottom-10 opacity-10">
                  {getIconComponent(iconName) &&
                    (() => {
                      const Icon = getIconComponent(iconName);
                      return Icon ? <Icon size={240} /> : null;
                    })()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
