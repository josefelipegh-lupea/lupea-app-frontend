"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { Brain, X } from "lucide-react";
import { subscribeLead } from "@/app/lib/api/subscribe";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal = ({ isOpen, onClose }: WaitlistModalProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg("Ingresa un correo válido.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      await subscribeLead(email, "ai_waitlist");
      setStatus("success");
      setEmail("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Algo salió mal. Intenta de nuevo.");
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
    onClose();
  };

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-surface rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition-colors"
          aria-label="Cerrar"
        >
          <X size={24} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
            <Brain size={24} />
          </div>
          <h3 className="font-display-lg text-xl text-primary">Lupita se está entrenando</h3>
        </div>

        <p className="font-body-md text-on-surface-variant mb-6">
          Déjanos tu correo para ser de los primeros en probar el Diagnóstico con IA.
        </p>

        {status === "success" ? (
          <div className="bg-surface-container rounded-2xl p-4 text-center">
            <p className="font-label-bold text-primary">¡Listo! Te avisaremos cuando Lupita esté lista. 🚀</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@ejemplo.com"
              className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 font-body-md text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-secondary-container w-full"
              disabled={status === "loading"}
            />
            {status === "error" && errorMsg && (
              <p className="font-label-sm text-error">{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-secondary-container hover:bg-secondary text-on-secondary-container font-label-bold uppercase py-3 px-6 rounded-full transition-all active:scale-95 disabled:opacity-60"
            >
              {status === "loading" ? "Registrando..." : "Quiero ser el primero"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
};
