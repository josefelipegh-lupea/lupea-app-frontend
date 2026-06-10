"use client";

import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative h-[640px] w-full flex items-center overflow-hidden bg-primary-container">
      <img
        className="absolute inset-0 w-full h-full object-cover"
        alt="High-performance car engine with dramatic lighting"
        src="/images/landing/hero.webp"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to right, rgba(6, 1, 50, 0.95) 30%, rgba(6, 1, 50, 0.4) 100%)",
        }}
      />
      <div className="relative max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-2xl space-y-6">
          <h1 className="font-display-lg text-5xl md:text-6xl text-white leading-tight">
            La red más inteligente de repuestos automotrices.
          </h1>
          <p className="font-body-lg text-lg md:text-xl text-on-primary-container max-w-lg">
            Conectamos talleres y usuarios particulares con la red más amplia de
            proveedores certificados para encontrar la pieza exacta en tiempo
            récord.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/user/register"
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold text-lg uppercase tracking-widest px-8 py-5 rounded-3xl shadow-xl active:scale-95 transition-all inline-block text-center"
            >
              Explorar Marketplace
            </Link>
            <Link
              href="/user/register"
              className="bg-transparent border-2 border-white/30 hover:border-white text-white font-label-bold text-lg uppercase tracking-widest px-8 py-5 rounded-3xl backdrop-blur-sm transition-all inline-block text-center"
            >
              Registro Gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
