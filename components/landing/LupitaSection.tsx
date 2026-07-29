"use client";

import { Brain } from "lucide-react";
import { useState } from "react";
import { WaitlistModal } from "./WaitlistModal";

export const LupitaSection = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="py-24 bg-secondary-container text-on-secondary-container overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-6">
            <Brain size={32} />
          </div>
          <h2 className="font-display-lg text-4xl mb-4">
            Lupita: el futuro del cuidado de tu carro
          </h2>
          <p className="font-body-lg mb-4 opacity-90">
            Lupea evoluciona para convertirse en la solución total para tu carro. La cara de esa evolución tiene nombre: Lupita, nuestra asistente IA.
          </p>
          <p className="font-body-md mb-8 opacity-80">
            Muy pronto, Lupita te guiará con diagnósticos gratuitos, te conectará con talleres certificados y te ayudará a llevar el historial de servicios de tu carro. Todo en el mismo lugar donde hoy lupeas tus repuestos.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-white text-primary font-label-bold uppercase py-4 px-8 rounded-full hover:bg-primary hover:text-white transition-all inline-block"
          >
            Pruébala primero
          </button>
        </div>
      </div>

      <WaitlistModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
};
