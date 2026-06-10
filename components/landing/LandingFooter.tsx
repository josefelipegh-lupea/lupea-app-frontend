"use client";

import Link from "next/link";
import { Share2, Globe, Send } from "lucide-react";

interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

interface FooterData {
  description?: string;
  columns?: FooterColumn[];
  newsletterTitle?: string;
  newsletterText?: string;
}

const DEFAULT_FOOTER: FooterData = {
  description:
    "La red inteligente de repuestos automotrices que conecta la oferta y demanda de piezas con eficiencia y transparencia.",
  columns: [
    {
      title: "Plataforma",
      links: [
        {
          label: "Explorar Marketplace",
          url: "/user/register",
          external: false,
        },
        {
          label: "Proveedores Certificados",
          url: "#",
          external: false,
        },
        { label: "Lupea Pro", url: "#", external: false },
        { label: "Soporte", url: "#", external: false },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacidad", url: "#", external: false },
        { label: "Términos y Condiciones", url: "#", external: false },
        { label: "Políticas de Devolución", url: "#", external: false },
        { label: "Contacto", url: "#", external: false },
      ],
    },
    {
      title: "Suscríbete",
      links: [
        {
          label:
            "Recibe alertas sobre piezas raras y ofertas exclusivas.",
          url: "#newsletter",
          external: false,
        },
      ],
    },
  ],
  newsletterTitle: "Suscríbete",
  newsletterText:
    "Recibe alertas sobre piezas raras y ofertas exclusivas.",
};

export const LandingFooter = ({ data }: { data?: FooterData }) => {
  const footer = { ...DEFAULT_FOOTER, ...data };

  return (
    <footer className="bg-primary text-on-primary">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-6 md:px-10 py-16 w-full max-w-7xl mx-auto">
        {/* Brand Column */}
        <div className="space-y-6">
          <div className="font-display-lg text-display-lg font-black text-white flex items-center gap-2">
            <img
              alt="Lupea Logo"
              className="h-12 w-auto object-contain"
              src="/images/landing/LUPEA_LOGO-FOOTER.svg"
            />
          </div>
          <p className="font-body-md text-on-primary-container leading-relaxed">
            {footer.description}
          </p>
        </div>

        {/* Footer Columns */}
        {footer.columns?.map((column, idx) => (
          <div key={idx}>
            <h4 className="font-label-bold text-label-bold uppercase tracking-widest text-white mb-6">
              {column.title}
            </h4>
            <ul className="space-y-4">
              {column.links.map((link, lidx) => (
                <li key={lidx}>
                  {link.url.startsWith("http") ? (
                    <a
                      className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                      href={link.url}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                      href={link.url}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright Bar */}
      <div className="bg-primary-container py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-on-primary-container">
            © 2026 Lupea. La red inteligente de repuestos automotrices.
          </p>
          <div className="flex gap-6">
            <a
              className="text-on-primary-container hover:text-white transition-colors"
              href="#"
              aria-label="Share"
            >
              <Share2 size={20} />
            </a>
            <a
              className="text-on-primary-container hover:text-white transition-colors"
              href="#"
              aria-label="Language"
            >
              <Globe size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
