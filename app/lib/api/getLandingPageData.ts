const API_URL =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ?? "http://localhost:1337/api";

export interface LandingPageData {
  documentId: string;
  hero: {
    title: string;
    subtitle: string;
    eyebrow?: string;
    primaryCta: { label: string; url: string; external?: boolean };
    secondaryCta?: { label: string; url: string; external?: boolean };
    backgroundImage: { url: string; alternativeText?: string };
  };
  stats: Array<{ value: string; label: string }>;
  howItWorks: {
    heading: string;
    eyebrow?: string;
    steps: Array<{ icon: string; title: string; description: string }>;
  };
  valueProps: Array<{
    badge?: string;
    title: string;
    theme: "buyer" | "pro";
    bullets: Array<{ icon: string; text: string }>;
    cta?: { label: string; url: string; external?: boolean };
  }>;
  marketplace: {
    title: string;
    description: string;
    image: { url: string; alternativeText?: string };
    chips: Array<{ label: string }>;
  };
  smartSearch: {
    title: string;
    description: string;
    cta?: { label: string; url: string; external?: boolean };
  };
  nav: {
    items: Array<{ label: string; url: string }>;
    loginCta: { label: string; url: string; external?: boolean };
    registerCta: { label: string; url: string; external?: boolean };
  };
  footer: {
    description: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; url: string; external?: boolean }>;
    }>;
    newsletterTitle?: string;
    newsletterText?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: { url: string };
  };
}

/**
 * Fetch landing page data desde Single Type /api/landing-page
 * El controller hace el populate profundo internamente
 * ISR: revalidate cada 60 segundos
 * Fallback: retorna null si falla, el frontend usa defaults
 */
export async function getLandingPageData(): Promise<LandingPageData | null> {
  try {
    // Single Type → endpoint singular (NO plural)
    const res = await fetch(`${API_URL}/landing-page`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // ISR: revalidate cada 60 segundos
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(
        `Error fetching landing page: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const responseData = await res.json();

    // Strapi v5 single type: { data: {...} }
    const landingPage = responseData.data || responseData;

    if (!landingPage) {
      console.warn("Landing page data is empty");
      return null;
    }

    return landingPage;
  } catch (error) {
    console.error("Error fetching landing page data:", error);
    return null;
  }
}

/**
 * Revalidación on-demand (FUTURO)
 * Descomentar cuando webhook de Strapi esté configurado
 * 
 * export async function revalidateLandingPage() {
 *   try {
 *     const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate-landing`, {
 *       method: "POST",
 *       headers: { "Content-Type": "application/json", "X-Revalidate-Secret": process.env.REVALIDATE_SECRET || "" },
 *     });
 *     return res.ok;
 *   } catch (error) {
 *     console.error("Error revalidating landing page:", error);
 *     return false;
 *   }
 * }
 */
