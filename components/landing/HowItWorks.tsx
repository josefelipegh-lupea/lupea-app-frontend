"use client";

import {
  FileText,
  Network,
  BadgeCheck,
  Truck,
} from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      Icon: FileText,
      title: "Solicitud",
      description: "Carga los datos de tu vehículo y la pieza que necesitas. Es rápido y sencillo.",
    },
    {
      Icon: Network,
      title: "Distribución",
      description: "Tu pedido se envía instantáneamente a nuestra red inteligente de proveedores.",
    },
    {
      Icon: BadgeCheck,
      title: "Cotización",
      description: "Recibe múltiples ofertas competitivas de piezas originales, OEM o alternativas.",
    },
    {
      Icon: Truck,
      title: "Orden",
      description: "Elige la mejor opción y recibe tu repuesto donde prefieras con total seguridad.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-secondary-container font-label-bold uppercase tracking-[0.2em]">
            Metodología Lupea
          </span>
          <h2 className="font-display-lg text-4xl text-primary mt-2">
            Cómo funciona la red
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="group p-8 bg-white rounded-3xl shadow-sm border border-outline-variant hover:border-secondary-container transition-all"
            >
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-6 text-primary group-hover:bg-secondary-container group-hover:text-white transition-colors">
                <step.Icon size={32} />
              </div>
              <h3 className="font-headline-sm text-primary mb-3">{step.title}</h3>
              <p className="font-body-md text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
