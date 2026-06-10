import { Metadata } from "next";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DualProposition } from "@/components/landing/DualProposition";
import { MarketplaceBento } from "@/components/landing/MarketplaceBento";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { AuthRedirectHandler } from "@/components/landing/AuthRedirectHandler";
import { getLandingPageData } from "@/app/lib/api/getLandingPageData";

/**
 * Server Component: SSR + ISR con fetch a Strapi
 * Renderiza el landing con datos del CMS o defaults si falla
 */
export async function generateMetadata(): Promise<Metadata> {
  const data = await getLandingPageData();
  const seo = data?.seo;

  return {
    title:
      seo?.metaTitle ||
      "Lupea | Red Inteligente de Repuestos Automotrices",
    description:
      seo?.metaDescription ||
      "Plataforma que conecta compradores de repuestos con 1.200+ proveedores certificados.",
    openGraph: {
      images: seo?.ogImage ? [{ url: seo.ogImage.url }] : [],
    },
  };
}

export default async function LandingPage() {
  const landingData = await getLandingPageData();

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-body-lg">
      <style>{`
        .landing-wrapper {
          --font-hanken: 'Hanken Grotesk';
        }
      `}</style>

      <div className="landing-wrapper">
        <LandingHeader data={landingData?.nav} />
        <main className="flex-1">
          <Hero data={landingData?.hero} />
          <StatsBar data={landingData?.stats} />
          <HowItWorks data={landingData?.howItWorks} />
          <DualProposition data={landingData?.valueProps} />
          <MarketplaceBento
            data={landingData?.marketplace}
            smartSearch={landingData?.smartSearch}
          />
        </main>
        <LandingFooter data={landingData?.footer} />
      </div>

      {/* Cliente-side redirect para usuarios autenticados */}
      <AuthRedirectHandler />
    </div>
  );
}
