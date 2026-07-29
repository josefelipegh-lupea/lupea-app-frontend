"use client";

import Link from "next/link";
import {
  BadgeCheck,
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
                Conductores y Talleres
              </span>
              <h2 className="font-display-lg text-3xl mb-4">Tu tiempo vale</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0 mt-1" />
                  <span className="font-body-md">Ahorra tiempo y olvídate de llamadas que no contestan, mensajes por WhatsApp en visto o recorrer la calle buscando una pieza.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0 mt-1" />
                  <span className="font-body-md">Recibe y compara múltiples cotizaciones y decide cuál es tu mejor opción.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-secondary-container flex-shrink-0 mt-1" />
                  <span className="font-body-md">Tus datos de contacto y teléfono están totalmente protegidos, solo se desbloquean al elegir un proveedor para comprarle.</span>
                </li>
              </ul>
              <Link
                href="/user/register"
                className="bg-white text-primary font-label-bold uppercase py-4 px-8 rounded-full hover:bg-secondary-container hover:text-on-secondary-container transition-all inline-block"
              >
                Lupea tu repuesto
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
                Tiendas y Proveedores
              </span>
              <h2 className="font-display-lg text-3xl mb-4">Clientes listos para comprar</h2>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-tertiary-fixed flex-shrink-0 mt-1" />
                  <span className="font-body-md">Recibe consultas limpias, detalladas y de clientes listos para comprar.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-tertiary-fixed flex-shrink-0 mt-1" />
                  <span className="font-body-md">Conéctate directo con clientes que están cerca de ti.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-tertiary-fixed flex-shrink-0 mt-1" />
                  <span className="font-body-md">El cliente llega directamente a tu negocio, y solo pagas cuando el cliente decide comprarte.</span>
                </li>
                <li className="flex items-start gap-3">
                  <BadgeCheck size={20} className="text-tertiary-fixed flex-shrink-0 mt-1" />
                  <span className="font-body-md">Como Aliado Pro: recibe respuestas y cotizaciones automáticas 24/7 con nuestra IA de gestión de inventario.</span>
                </li>
              </ul>
              <Link
                href="/vendor/register"
                className="bg-secondary-container text-on-secondary-container font-label-bold uppercase py-4 px-8 rounded-full hover:bg-white hover:text-primary transition-all inline-block"
              >
                Únete a la Red Lupea
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
