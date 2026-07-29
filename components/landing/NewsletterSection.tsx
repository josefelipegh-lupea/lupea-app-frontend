"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { subscribeLead } from "@/app/lib/api/subscribe";

export const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      await subscribeLead(email, "footer");
      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="py-20 bg-secondary-container">
      <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-lg text-center md:text-left">
          <h2 className="font-display-lg text-3xl md:text-4xl text-on-secondary-container mb-2">
            Recibe novedades de Lupea
          </h2>
          <p className="font-body-lg text-on-secondary-container opacity-80">
            Sé la primera persona en probar nuestro diagnóstico IA.
          </p>
        </div>

        <div className="w-full max-w-md">
          {status === "success" ? (
            <p className="font-label-bold text-on-secondary-container bg-white/40 rounded-2xl px-6 py-4 text-center">
              ¡Listo! Te tendremos al tanto.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <div className="flex">
                <input
                  className="bg-white border-none text-primary rounded-l-xl px-4 py-4 focus:ring-2 focus:ring-primary w-full placeholder:text-on-surface-variant/50 focus:outline-none"
                  placeholder="email@ejemplo.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={status === "loading"}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="bg-primary text-on-primary p-4 rounded-r-xl hover:bg-primary-container transition-all disabled:opacity-60"
                  aria-label="Suscribirme"
                >
                  <Send size={20} />
                </button>
              </div>
              {status === "error" && (
                <p className="font-label-sm text-error">Ingresa un correo válido o intenta de nuevo.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
