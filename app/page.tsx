"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { Hero } from "@/components/landing/Hero";
import { StatsBar } from "@/components/landing/StatsBar";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { DualProposition } from "@/components/landing/DualProposition";
import { MarketplaceBento } from "@/components/landing/MarketplaceBento";
import { LupitaSection } from "@/components/landing/LupitaSection";
import { NewsletterSection } from "@/components/landing/NewsletterSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in (client-side only, no blocking)
    const jwt = localStorage.getItem("jwt");
    const userData = localStorage.getItem("userData");

    if (jwt && userData) {
      try {
        const user = JSON.parse(userData);
        const role = user?.role === "provider" ? "vendor" : "user";
        // Redirect to dashboard by role
        router.replace(`/home/${role}`);
      } catch (error) {
        // If parsing fails, default to /home/user
        console.error("Error parsing user data:", error);
        router.replace("/home/user");
      }
    }
    // If no jwt, landing is already rendered (no flash)
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-body-lg">
      {/* Apply Hanken Grotesk to landing wrapper */}
      <style>{`
        .landing-wrapper {
          --font-hanken: 'Hanken Grotesk';
        }
      `}</style>

      <div className="landing-wrapper">
        <LandingHeader />
        <main className="flex-1">
          <Hero />
          <StatsBar />
          <HowItWorks />
          <DualProposition />
          <MarketplaceBento />
          <LupitaSection />
          <NewsletterSection />
        </main>
        <LandingFooter />
      </div>
    </div>
  );
}
