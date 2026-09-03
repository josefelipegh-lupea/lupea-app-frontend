import { SectionShell } from "./SectionShell";

const FASES = [
  {
    title: "Fase 1",
    badge: "En curso",
    body: "Consolidar la versión Alfa y validar tracción en Barquisimeto y Cabudare.",
    active: true,
  },
  {
    title: "Fase 2",
    badge: null,
    body: "Diagnóstico conversacional por texto y voz con Lupita, lanzamiento regional, ronda semilla.",
    active: false,
  },
  {
    title: "Fase 3",
    badge: null,
    body: "Integración B2B con ERP de proveedores y API Lupea Pro, cotización continua 24 horas.",
    active: false,
  },
  {
    title: "Fase 4",
    badge: null,
    body: "Ecosistema integral, talleres certificados, historial vehicular con IA, triángulo usuario-taller-tienda.",
    active: false,
  },
];

export function Section06Oportunidad() {
  return (
    <SectionShell num="06" label="La Oportunidad" labelFontSize="clamp(22px,1.9vw,36px)">
      <div className="flex flex-col" style={{ gap: "clamp(22px,3.4vh,46px)" }}>
        {/* Responsive roadmap: 1 col mobile (vertical timeline) → 4 col md (horizontal) */}
        <div
          className="grid grid-cols-1 md:grid-cols-4"
          style={{ gap: "clamp(12px,1.3vw,26px)" }}
        >
          {FASES.map((f, idx) => (
            <div key={idx} className="flex flex-col" style={{ gap: "14px" }}>
              {/* Timeline dot + connector */}
              <div className="flex items-center" style={{ gap: "8px" }}>
                <span
                  className="flex-none"
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: f.active ? "#DB8F1B" : "transparent",
                    border: f.active ? "none" : "2px solid #1E1A4959",
                    boxSizing: "border-box",
                  }}
                />
                {/* Horizontal connector: only shown in md+ grid layout */}
                {idx < FASES.length - 1 && (
                  <span
                    className="hidden md:block flex-1"
                    style={{
                      height: "2px",
                      background: f.active ? "#DB8F1B" : "#1E1A4926",
                    }}
                  />
                )}
              </div>

              <div className="flex items-baseline flex-wrap" style={{ gap: "10px" }}>
                <h3
                  className="m-0 font-bold"
                  style={{ fontSize: "clamp(15px,1.3vw,24px)", color: "#1E1A49" }}
                >
                  {f.title}
                </h3>
                {f.badge && (
                  <span
                    className="font-bold uppercase tracking-[.08em]"
                    style={{
                      background: "#DB8F1B14",
                      color: "#DB8F1B",
                      fontSize: "11px",
                      padding: "6px 12px",
                      borderRadius: "20px",
                    }}
                  >
                    {f.badge}
                  </span>
                )}
              </div>

              {/* Body text: min 14px for readability */}
              <p
                className="m-0 leading-[1.5]"
                style={{ fontSize: "clamp(14px,1vw,19px)", color: "#1E1A49BF" }}
              >
                {f.body}
              </p>
            </div>
          ))}
        </div>

        {/* Closing statement */}
        <div
          style={{
            borderTop: "1px solid #1E1A491F",
            paddingTop: "clamp(16px,2.4vh,30px)",
            maxWidth: "52ch",
          }}
        >
          <p
            className="m-0 font-semibold leading-[1.35]"
            style={{ fontSize: "clamp(17px,1.5vw,30px)", color: "#1E1A49" }}
          >
            <span style={{ color: "#DB8F1B" }}>Profundidad antes que amplitud</span>{" "}
            — dominar la cadena completa de reparación, del diagnóstico a la pieza
            instalada.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
