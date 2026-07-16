"use client";

import {
  FileText,
  Scale,
  CheckCircle,
} from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      Icon: FileText,
      title: "Llenas la consulta",
      description: "Elige los datos de tu carro y escribe lo que necesitas (¡Te toma menos de un minuto!).",
    },
    {
      Icon: Scale,
      title: "Comparas",
      description: "Recibes ofertas reales de proveedores verificados y las comparas lado a lado de forma transparente.",
    },
    {
      Icon: CheckCircle,
      title: "Decides",
      description: "Eliges la mejor opción, se genera la orden de compra y se activa un chat directo para concretar.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display-lg text-4xl text-primary mt-2">
            Nosotros buscamos por ti.
          </h2>
          <p className="font-body-lg text-on-surface-variant mt-4 max-w-xl mx-auto">
            Con Lupea solucionas la búsqueda en tres pasos sencillos y transparentes:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
