"use client";

import Link from "next/link";
import { Share2, Globe, Send } from "lucide-react";
import { useState } from "react";
import { subscribeLead } from "@/app/lib/api/subscribe";

export const LandingFooter = () => {
  const [footerEmail, setFooterEmail] = useState("");
  const [footerStatus, setFooterStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleFooterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!footerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(footerEmail)) {
      setFooterStatus("error");
      return;
    }
    setFooterStatus("loading");
    try {
      await subscribeLead(footerEmail, "footer");
      setFooterStatus("success");
      setFooterEmail("");
    } catch {
      setFooterStatus("error");
    }
  };

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
            Los repuestos de tu carro en un solo lugar. Sin caminar, sin llamadas, sin estrés. La IA que cuida la salud de tu vehículo.
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
                Buscar Repuestos
              </Link>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#how-it-works"
              >
                Cómo Funciona
              </a>
            </li>
            <li>
              <a
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="#ecosistema"
              >
                El Ecosistema
              </a>
            </li>
            <li>
              <Link
                className="font-label-sm text-on-primary-container hover:text-white transition-all hover:underline"
                href="/vendor/register"
              >
                Unirse a la Red
              </Link>
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
            Recibe novedades de Lupea y sé la primera persona en probar nuestro diagnóstico IA.
          </p>
          {footerStatus === "success" ? (
            <p className="font-label-sm text-secondary-container">¡Listo! Te tendremos al tanto.</p>
          ) : (
            <form onSubmit={handleFooterSubscribe} className="flex flex-col gap-2">
              <div className="flex">
                <input
                  className="bg-primary-container border-none text-white rounded-l-lg px-4 py-3 focus:ring-2 focus:ring-secondary-container w-full placeholder:text-on-primary-container/50 focus:outline-none"
                  placeholder="email@ejemplo.com"
                  type="email"
                  value={footerEmail}
                  onChange={(e) => setFooterEmail(e.target.value)}
                  disabled={footerStatus === "loading"}
                />
                <button
                  type="submit"
                  disabled={footerStatus === "loading"}
                  className="bg-secondary-container text-on-secondary-container p-3 rounded-r-lg hover:bg-secondary transition-all disabled:opacity-60"
                >
                  <Send size={20} />
                </button>
              </div>
              {footerStatus === "error" && (
                <p className="font-label-sm text-error-container">Ingresa un correo válido o intenta de nuevo.</p>
              )}
            </form>
          )}
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-primary-container py-6">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-label-sm text-on-primary-container">
            © 2026 Lupea. Los repuestos de tu carro en un solo lugar.
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
