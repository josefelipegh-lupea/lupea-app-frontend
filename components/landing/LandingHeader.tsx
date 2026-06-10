"use client";

import Link from "next/link";
import { useState } from "react";

interface NavItem {
  label: string;
  url: string;
}

interface NavData {
  items?: NavItem[];
  loginCta?: { label: string; url: string; external?: boolean };
  registerCta?: { label: string; url: string; external?: boolean };
}

const DEFAULT_NAV: NavData = {
  items: [
    { label: "Cómo Funciona", url: "#how-it-works" },
    { label: "Beneficios", url: "#benefits" },
    { label: "Marketplace", url: "#marketplace" },
  ],
  loginCta: { label: "Iniciar Sesión", url: "/login" },
  registerCta: { label: "Registrarse", url: "/user/register" },
};

export const LandingHeader = ({ data }: { data?: NavData }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const nav = { ...DEFAULT_NAV, ...data };

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-display-lg text-display-lg font-black text-primary"
        >
          <img
            alt="Lupea Logo"
            className="w-auto object-contain h-12"
            src="/images/landing/LUPEA_LOGO.svg"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          {nav.items?.map((item, idx) => (
            <a
              key={idx}
              className="text-on-surface-variant hover:text-primary transition-all font-label-bold text-label-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-surface-container"
              href={item.url}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center">
          {nav.loginCta && (
            <Link
              href={nav.loginCta.url}
              className="hidden md:block font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant hover:text-primary px-4 py-2 transition-all"
            >
              {nav.loginCta.label}
            </Link>
          )}
          {nav.registerCta && (
            <Link
              href={nav.registerCta.url}
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold text-label-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-md active:scale-95 transition-all"
            >
              {nav.registerCta.label}
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden ml-4 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className="text-2xl">☰</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface border-t border-outline-variant">
          <nav className="flex flex-col gap-4 p-6">
            {nav.items?.map((item, idx) => (
              <a
                key={idx}
                className="text-on-surface-variant hover:text-primary transition-all font-label-bold uppercase"
                href={item.url}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            {nav.loginCta && (
              <Link
                href={nav.loginCta.url}
                className="text-on-surface-variant font-label-bold uppercase"
              >
                {nav.loginCta.label}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
