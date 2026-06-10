"use client";

import Link from "next/link";
import Image from "next/image";
import { Brain, ArrowRight } from "lucide-react";

interface Chip {
  label: string;
}

interface MarketplaceData {
  title?: string;
  description?: string;
  image?: { url: string; alternativeText?: string };
  chips?: Chip[];
}

interface SmartSearchData {
  title?: string;
  description?: string;
  cta?: { label: string; url: string; external?: boolean };
}

const DEFAULT_MARKETPLACE: MarketplaceData = {
  title: "Marketplace Global",
  description:
    "Navega por miles de categorías, desde motores completos hasta los tornillos más específicos.",
  image: {
    url: "/images/landing/marketplace.png",
    alternativeText: "Automotive parts assembly",
  },
  chips: [
    { label: "Motores" },
    { label: "Frenos" },
    { label: "Suspensión" },
    { label: "Carrocería" },
  ],
};

const DEFAULT_SMART_SEARCH: SmartSearchData = {
  title: "Búsqueda Inteligente",
  description:
    "Nuestra IA asocia códigos OEM y descripciones para que nunca compres la pieza equivocada.",
  cta: {
    label: "Probar buscador",
    url: "/user/register",
    external: false,
  },
};

export const MarketplaceBento = ({
  data,
  smartSearch,
}: {
  data?: MarketplaceData;
  smartSearch?: SmartSearchData;
}) => {
  const marketplace = { ...DEFAULT_MARKETPLACE, ...data };
  const search = { ...DEFAULT_SMART_SEARCH, ...smartSearch };

  return (
    <section id="marketplace" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Marketplace Global Card */}
          <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center border border-outline-variant">
            <div className="flex-1">
              <h3 className="font-display-lg text-2xl text-primary mb-4">
                {marketplace.title}
              </h3>
              <p className="font-body-md text-on-surface-variant mb-6">
                {marketplace.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {marketplace.chips?.map((chip, idx) => (
                  <span
                    key={idx}
                    className="bg-surface-container px-3 py-1 rounded-full text-[10px] font-label-bold text-primary uppercase"
                  >
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex-1 w-full h-48 bg-primary-container rounded-2xl overflow-hidden">
              {marketplace.image ? (
                <Image
                  className="w-full h-full object-cover"
                  alt={
                    marketplace.image.alternativeText ||
                    "Automotive parts assembly"
                  }
                  src={marketplace.image.url}
                  width={400}
                  height={300}
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </div>
          </div>

          {/* Smart Search Card */}
          <div className="bg-secondary-container rounded-3xl p-8 flex flex-col justify-between text-on-secondary-container">
            <div>
              <Brain size={48} className="mb-4" />
              <h3 className="font-display-lg text-2xl mb-2">
                {search.title}
              </h3>
              <p className="font-body-md opacity-80">{search.description}</p>
            </div>
            <div className="mt-8">
              {search.cta && (
                <Link
                  href={search.cta.url}
                  className="font-label-bold uppercase flex items-center gap-2 group hover:gap-3 transition-all"
                >
                  {search.cta.label} <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
