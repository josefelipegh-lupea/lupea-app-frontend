"use client";

export const StatsBar = () => {
  return (
    <section className="bg-primary-container py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="text-center">
          <div className="font-display-lg text-4xl text-secondary-container">50k+</div>
          <div className="font-label-bold text-label-bold text-on-primary-container uppercase">
            Repuestos Disponibles
          </div>
        </div>
        <div className="text-center">
          <div className="font-display-lg text-4xl text-secondary-container">1.200</div>
          <div className="font-label-bold text-label-bold text-on-primary-container uppercase">
            Proveedores
          </div>
        </div>
        <div className="text-center">
          <div className="font-display-lg text-4xl text-secondary-container">15min</div>
          <div className="font-label-bold text-label-bold text-on-primary-container uppercase">
            Tiempo de Respuesta
          </div>
        </div>
        <div className="text-center">
          <div className="font-display-lg text-4xl text-secondary-container">100%</div>
          <div className="font-label-bold text-label-bold text-on-primary-container uppercase">
            Garantía Lupea
          </div>
        </div>
      </div>
    </section>
  );
};
