import { SectionShell } from "./SectionShell";

const STEPS = [
  {
    n: "1",
    title: "Prediagnóstico",
    body: "Lupita, la asistente IA, da un prediagnóstico a partir de lo que el conductor describe o de una foto.",
    accent: false,
  },
  {
    n: "2",
    title: "Lenguaje llano",
    body: "Le explica en lenguaje llano qué puede estar fallando, para que llegue al mecánico informado.",
    accent: false,
  },
  {
    n: "3",
    title: "Solicitud correcta",
    body: "Lo acompaña a construir la solicitud con los repuestos correctos y su nombre técnico real.",
    accent: false,
  },
  {
    n: "4",
    title: "Matching",
    body: "Matching automático por rubro, marca del vehículo y ubicación.",
    accent: false,
  },
  {
    n: "5",
    title: "Ofertas lado a lado",
    body: "Los aliados responden con cotizaciones comparables lado a lado.",
    accent: true,
  },
];

export function Section03Solucion() {
  return (
    <SectionShell num="03" label="La Solución" labelFontSize="clamp(22px,1.9vw,36px)">
      <div className="flex flex-col" style={{ gap: "clamp(22px,3.4vh,48px)" }}>
        <p
          className="m-0 font-semibold leading-[1.35]"
          style={{
            fontSize: "clamp(18px,1.6vw,30px)",
            maxWidth: "38ch",
            color: "#1E1A49",
          }}
        >
          De lo que el conductor describe a cotizaciones comparables, en un solo lupeo.
        </p>

        {/* 5-column step flow */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(5,1fr)",
            gap: "clamp(10px,1vw,20px)",
          }}
        >
          {STEPS.map((s, idx) => (
            <div key={s.n} className="flex flex-col" style={{ gap: "14px" }}>
              <div className="flex items-center" style={{ gap: "10px" }}>
                <span
                  className="flex-none flex items-center justify-center text-white font-bold"
                  style={{
                    width: "clamp(30px,2.6vw,46px)",
                    height: "clamp(30px,2.6vw,46px)",
                    borderRadius: "50%",
                    background: s.accent ? "#DB8F1B" : "#1E1A49",
                    fontSize: "clamp(13px,1.05vw,19px)",
                  }}
                >
                  {s.n}
                </span>
                {/* connector — all except last */}
                {idx < STEPS.length - 1 && (
                  <span
                    className="flex-1"
                    style={{ height: "2px", background: "#1E1A4926" }}
                  />
                )}
              </div>
              <h3
                className="m-0 font-bold leading-[1.25]"
                style={{ fontSize: "clamp(14px,1.15vw,21px)", color: "#1E1A49" }}
              >
                {s.title}
              </h3>
              <p
                className="m-0 leading-[1.5]"
                style={{ fontSize: "clamp(12px,.98vw,18px)", color: "#1E1A49BF" }}
              >
                {s.body}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div
          className="flex items-center self-start"
          style={{
            gap: "16px",
            border: "1px solid #DB8F1B4D",
            borderRadius: "24px",
            padding: "clamp(14px,1.5vw,24px) clamp(18px,2vw,32px)",
          }}
        >
          <span
            className="text-white font-bold uppercase tracking-[.08em]"
            style={{
              background: "#DB8F1B",
              fontSize: "12px",
              padding: "8px 14px",
              borderRadius: "20px",
            }}
          >
            Un solo lupeo
          </span>
          <p
            className="m-0 font-medium leading-[1.45]"
            style={{ fontSize: "clamp(14px,1.1vw,21px)", color: "#1E1A49" }}
          >
            Una solicitud puede llevar varios repuestos: ocho piezas siguen siendo
            un solo lupeo.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
