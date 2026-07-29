"use client";

import Link from "next/link";

export const MarketplaceBento = () => {
  return (
    <section id="ecosistema" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display-lg text-4xl text-primary">
            El Ecosistema Lupea
          </h2>
          <p className="font-body-lg text-on-surface-variant mt-2">
            Todo lo de tu carro, lupeable.
          </p>
        </div>
        <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant">
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
              Haz tu primer lupeo
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
      </div>
    </section>
  );
};
