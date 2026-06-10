"use client";

import Link from "next/link";
import Image from "next/image";

interface HeroData {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  primaryCta?: { label: string; url: string; external?: boolean };
  secondaryCta?: { label: string; url: string; external?: boolean };
  backgroundImage?: { url: string; alternativeText?: string };
}

const DEFAULT_HERO: HeroData = {
  title: "La red más inteligente de repuestos automotrices.",
  subtitle:
    "Conectamos talleres y usuarios particulares con la red más amplia de proveedores certificados para encontrar la pieza exacta en tiempo récord.",
  primaryCta: { label: "Explorar Marketplace", url: "/user/register" },
  secondaryCta: { label: "Registro Gratis", url: "/user/register" },
  backgroundImage: {
    url: "/images/landing/hero.webp",
    alternativeText: "High-performance car engine with dramatic lighting",
  },
};

export const Hero = ({ data }: { data?: HeroData }) => {
  const heroData = { ...DEFAULT_HERO, ...data }; // Merge: CMS + defaults

  return (
    <section className="relative h-[640px] w-full flex items-center overflow-hidden bg-primary-container">
      <Image
        className="absolute inset-0 w-full h-full object-cover"
        alt={heroData.backgroundImage?.alternativeText || "Hero background"}
        src={heroData.backgroundImage?.url || DEFAULT_HERO.backgroundImage!.url}
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
            {heroData.title}
          </h1>
          <p className="font-body-lg text-lg md:text-xl text-on-primary-container max-w-lg">
            {heroData.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link
              href={heroData.primaryCta?.url || "/user/register"}
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold text-lg uppercase tracking-widest px-8 py-5 rounded-3xl shadow-xl active:scale-95 transition-all inline-block text-center"
            >
              {heroData.primaryCta?.label}
            </Link>
            {heroData.secondaryCta && (
              <Link
                href={heroData.secondaryCta.url}
                className="bg-transparent border-2 border-white/30 hover:border-white text-white font-label-bold text-lg uppercase tracking-widest px-8 py-5 rounded-3xl backdrop-blur-sm transition-all inline-block text-center"
              >
                {heroData.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
