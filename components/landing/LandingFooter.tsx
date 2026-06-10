"use client";

import Link from "next/link";
import { Share2, Globe, Send } from "lucide-react";

export const LandingFooter = () => {
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
            La red inteligente de repuestos automotrices que conecta la oferta y demanda de piezas con eficiencia y transparencia.
          </p>
        </div>

        {/* Platform Column */}
        <div>
          <h4 className="font-label-bold text-label-bold uppercase tracking-widest text-white mb-6">
            Plataforma
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="/user/register"
              >
                Explorar Marketplace
              </Link>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Proveedores Certificados
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Lupea Pro
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Soporte
              </a>
            </li>
          </ul>
        </div>

        {/* Legal Column */}
        <div>
          <h4 className="font-label-bold text-label-bold uppercase tracking-widest text-white mb-6">
            Legal
          </h4>
          <ul className="space-y-4">
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Privacidad
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Términos y Condiciones
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Políticas de Devolución
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#"
              >
                Contacto
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter Column */}
        <div className="space-y-6">
          <h4 className="font-label-bold text-label-bold uppercase tracking-widest text-white">
            Suscríbete
          </h4>
          <p className="font-body-md text-on-primary-container">
            Recibe alertas sobre piezas raras y ofertas exclusivas.
          </p>
          <div className="flex">
            <input
              className="bg-primary-container border-none text-white rounded-l-lg px-4 py-3 focus:ring-2 focus:ring-secondary-container w-full placeholder:text-on-primary-container/50"
              placeholder="email@ejemplo.com"
              type="email"
            />
            <button className="bg-secondary-container text-on-secondary-container p-3 rounded-r-lg hover:bg-secondary transition-all">
              <Send size={20} />
            </button>
          </div>
        </div>
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
