"use client";

import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";
import { useState } from "react";
import { WaitlistModal } from "./WaitlistModal";

export const MarketplaceBento = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section id="ecosistema" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display-lg text-4xl text-primary">
            El Ecosistema Lupea
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cotizaciones al Instante Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant">
            <div className="flex-1">
              <h3 className="font-display-lg text-2xl text-primary mb-4">
                Cotizaciones al Instante
              </h3>
              <p className="font-body-md text-on-surface-variant mb-6">
                Encuentra desde un motor completo hasta el componente más específico. Genera tu consulta en las categorías de mayor rotación del país:
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Tren Delantero
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Sistema de Frenos
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Motor y Caja
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Electricidad
                </span>
              </div>
              <Link
                href="/user/register"
                className="bg-primary text-on-primary font-label-bold uppercase py-3 px-6 rounded-full hover:bg-primary-container transition-all inline-block"
              >
                Iniciar una búsqueda
              </Link>
            </div>
            <div className="flex-1 w-full h-48 bg-primary-container rounded-2xl overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Automotive parts assembly"
                src="/images/landing/marketplace.png"
              />
            </div>
          </div>

          {/* Futuro / IA Card */}
          <div className="bg-secondary-container rounded-3xl p-8 flex flex-col justify-between text-on-secondary-container">
            <div>
              <Brain size={48} className="mb-4" />
              <h3 className="font-display-lg text-2xl mb-2">El Futuro de la Salud Automotriz</h3>
              <p className="font-body-md opacity-80 mb-4">
                Lupea evoluciona para convertirse en la solución total para tu vehículo. Estamos construyendo un ecosistema digital inteligente:
              </p>
              <ul className="space-y-3 font-body-md opacity-90">
                <li>
                  <strong>Acompañamiento con IA:</strong> Muy pronto, Lupita te guiará con diagnósticos gratuitos y conectará directamente con talleres certificados, además de ayudarte a gestionar el historial de servicios de tu vehículo.
                </li>
                <li>
                  <strong>Gestión IA para tiendas:</strong> Respuestas y cotizaciones automáticas 24/7 para nuestros aliados comerciales Premium.
                </li>
              </ul>
            </div>
            <div className="mt-8">
              <button
                onClick={() => setModalOpen(true)}
                className="font-label-bold uppercase flex items-center gap-2 group hover:gap-3 transition-all"
              >
                Conocer la visión <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <WaitlistModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
};
