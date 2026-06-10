"use client";

import Link from "next/link";
import {
  BadgeCheck,
  TrendingUp,
  ShoppingCart,
  Store,
} from "lucide-react";

export const DualProposition = () => {
  return (
    <section id="benefits" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-12 items-stretch">
          {/* Buyers Card */}
          <div className="flex-1 relative p-12 bg-primary-container rounded-3xl text-white overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg font-label-bold text-[10px] uppercase mb-4">
                Para Compradores
              </span>
              <h2 className="font-display-lg text-3xl mb-4">Compre con confianza</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0" />
                  <span className="font-body-md">Garantía de compatibilidad total</span>
                </li>
                <li className="flex items-center gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0" />
                  <span className="font-body-md">Pagos seguros y protegidos</span>
                </li>
                <li className="flex items-center gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0" />
                  <span className="font-body-md">Soporte técnico especializado</span>
                </li>
              </ul>
              <Link
                href="/user/register"
                className="bg-white text-primary font-label-bold uppercase py-4 px-8 rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all inline-block"
              >
                Buscar Repuestos
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <ShoppingCart size={240} />
            </div>
          </div>

          {/* Provider Card */}
          <div className="flex-1 relative p-12 bg-tertiary-container rounded-3xl text-white overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block px-3 py-1 bg-on-tertiary-container text-white rounded-lg font-label-bold text-[10px] uppercase mb-4">
                Lupea Pro
              </span>
              <h2 className="font-display-lg text-3xl mb-4">Venda más y mejor</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <TrendingUp size={20} className="text-on-tertiary-container flex-shrink-0" />
                  <span className="font-body-md">Acceso a miles de pedidos mensuales</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp size={20} className="text-on-tertiary-container flex-shrink-0" />
                  <span className="font-body-md">Gestión de inventario inteligente</span>
                </li>
                <li className="flex items-center gap-3">
                  <TrendingUp size={20} className="text-on-tertiary-container flex-shrink-0" />
                  <span className="font-body-md">Reportes de mercado en tiempo real</span>
                </li>
              </ul>
              <Link
                href="/vendor/register"
                className="bg-secondary-container text-on-secondary-container font-label-bold uppercase py-4 px-8 rounded-full hover:bg-white hover:text-primary transition-all inline-block"
              >
                Unirse como Proveedor
              </Link>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-10">
              <Store size={240} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
