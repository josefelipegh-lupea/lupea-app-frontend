"use client";

import Link from "next/link";
import { Brain, ArrowRight } from "lucide-react";

export const MarketplaceBento = () => {
  return (
    <section id="marketplace" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Marketplace Global Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant">
            <div className="flex-1">
              <h3 className="font-display-lg text-2xl text-primary mb-4">
                Marketplace Global
              </h3>
              <p className="font-body-md text-on-surface-variant mb-6">
                Navega por miles de categorías, desde motores completos hasta los tornillos más específicos.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Motores
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Frenos
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Suspensión
                </span>
                <span className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase">
                  Carrocería
                </span>
              </div>
            </div>
            <div className="flex-1 w-full h-48 bg-primary-container rounded-2xl overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Automotive parts assembly"
                src="/images/landing/marketplace.png"
              />
            </div>
          </div>

          {/* Smart Search Card */}
          <div className="bg-secondary-container rounded-3xl p-8 flex flex-col justify-between text-on-secondary-container">
            <div>
              <Brain size={48} className="mb-4" />
              <h3 className="font-display-lg text-2xl mb-2">Búsqueda Inteligente</h3>
              <p className="font-body-md opacity-80">
                Nuestra IA asocia códigos OEM y descripciones para que nunca compres la pieza equivocada.
              </p>
            </div>
            <div className="mt-8">
              <Link
                href="/user/register"
                className="font-label-bold uppercase flex items-center gap-2 group hover:gap-3 transition-all"
              >
                Probar buscador{" "}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
