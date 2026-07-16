"use client";

import Link from "next/link";
import { useState } from "react";

export const LandingHeader = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-surface/90 backdrop-blur-md sticky top-0 z-50 border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-display-lg text-display-lg font-black text-primary">
          <img
            alt="Lupea Logo"
            className="w-auto object-contain h-12"
            src="/images/landing/LUPEA_LOGO.svg"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-8 items-center">
          <a
            className="text-on-surface-variant hover:text-primary transition-all font-label-bold text-label-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-surface-container"
            href="#how-it-works"
          >
            Cómo Funciona
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-all font-label-bold text-label-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-surface-container"
            href="#benefits"
          >
            Beneficios
          </a>
          <a
            className="text-on-surface-variant hover:text-primary transition-all font-label-bold text-label-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-surface-container"
            href="#ecosistema"
          >
            Ecosistema
          </a>
        </nav>

        {/* CTA Buttons */}
        <div className="flex gap-4 items-center">
          <Link
            href="/login"
            className="hidden md:block font-label-bold text-label-bold uppercase tracking-wider text-on-surface-variant hover:text-primary px-4 py-2 transition-all"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/user/register"
            className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold text-label-bold uppercase tracking-wider px-6 py-3 rounded-full shadow-md active:scale-95 transition-all"
          >
            Registrarse
          </Link>
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
            <a
              className="text-on-surface-variant hover:text-primary transition-all font-label-bold uppercase"
              href="#how-it-works"
              onClick={() => setMenuOpen(false)}
            >
              Cómo Funciona
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-all font-label-bold uppercase"
              href="#benefits"
              onClick={() => setMenuOpen(false)}
            >
              Beneficios
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-all font-label-bold uppercase"
              href="#ecosistema"
              onClick={() => setMenuOpen(false)}
            >
              Ecosistema
            </a>
            <Link href="/login" className="text-on-surface-variant font-label-bold uppercase">
              Iniciar Sesión
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
