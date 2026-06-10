"use client";

interface Stat {
  value: string;
  label: string;
}

const DEFAULT_STATS: Stat[] = [
  { value: "50k+", label: "Repuestos Disponibles" },
  { value: "1.200", label: "Proveedores" },
  { value: "15min", label: "Tiempo de Respuesta" },
  { value: "100%", label: "Garantía Lupea" },
];

export const StatsBar = ({ data }: { data?: Stat[] }) => {
  const stats = data || DEFAULT_STATS;

  return (
    <section className="bg-primary-container py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="text-center">
            <div className="font-display-lg text-4xl text-secondary-container">
              {stat.value}
            </div>
            <div className="font-label-bold text-label-bold text-on-primary-container uppercase">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
