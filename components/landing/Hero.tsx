"use client";

import Link from "next/link";
import Image from "next/image";

export const Hero = () => {
  return (
    <section className="relative h-[640px] w-full flex items-center overflow-hidden bg-primary-container">
      <Image
        className="absolute inset-0 w-full h-full object-cover"
        alt="High-performance car engine with dramatic lighting"
        src="/images/landing/hero.webp"
        fill
        priority
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
            Los repuestos de tu carro en un solo lugar. Sin caminar, sin llamadas, sin estrés.
          </h1>
          <p className="font-body-lg text-lg md:text-xl text-on-primary-container max-w-lg">
            La potencia de la IA te acompaña y te guía para mantener la salud de tu carro. Realiza una sola consulta y recibe decenas de cotizaciones de las tiendas de repuestos de tu ciudad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href="/user/register"
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold text-lg uppercase tracking-widest px-8 py-5 rounded-3xl shadow-xl active:scale-95 transition-all inline-block text-center"
            >
              Registrarme Gratis
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
