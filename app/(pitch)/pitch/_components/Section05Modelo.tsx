import { SectionShell } from "./SectionShell";

export function Section05Modelo() {
  return (
    <SectionShell
      num="05"
      label="Modelo de Negocios"
      labelFontSize="clamp(20px,1.75vw,33px)"
    >
      <div className="flex flex-col" style={{ gap: "clamp(16px,2.4vh,32px)" }}>
        {/* Responsive grid: 1 col mobile → 2 col md (desktop) */}
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "clamp(14px,1.8vw,32px)" }}
        >
          {/* Lado usuario */}
          <div
            className="flex flex-col"
            style={{
              border: "1px solid #1E1A4926",
              borderRadius: "36px",
              padding: "clamp(20px,2.2vw,42px)",
              gap: "16px",
            }}
          >
            <span
              className="self-start font-bold uppercase tracking-[.1em]"
              style={{
                background: "#E6AD1926",
                color: "#1E1A49",
                fontSize: "12px",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              Lado usuario
            </span>
            <h3
              className="m-0 font-bold leading-[1.25]"
              style={{ fontSize: "clamp(17px,1.5vw,29px)", color: "#1E1A49" }}
            >
              Cinco lupas gratuitas al mes, paquetes adicionales desde el perfil
            </h3>
            {/* Body text: min 14px for readability */}
            <p
              className="m-0 leading-[1.55]"
              style={{ fontSize: "clamp(14px,1.05vw,20px)", color: "#1E1A49BF" }}
            >
              La lupa es un portón de uso justo, no la caja registradora. El ingreso
              de este lado es marginal a propósito.
            </p>
          </div>

          {/* Lado aliado */}
          <div
            className="flex flex-col"
            style={{
              borderRadius: "36px",
              padding: "clamp(20px,2.2vw,42px)",
              gap: "16px",
              background: "linear-gradient(150deg,#1E1A49,#4C1952)",
            }}
          >
            <span
              className="self-start text-white font-bold uppercase tracking-[.1em]"
              style={{
                background: "#DB8F1B",
                fontSize: "12px",
                padding: "8px 16px",
                borderRadius: "20px",
              }}
            >
              Lado aliado
            </span>
            <h3
              className="m-0 text-white font-bold leading-[1.25]"
              style={{ fontSize: "clamp(17px,1.5vw,29px)" }}
            >
              Pay per match: se descuenta un token solo cuando el cliente acepta la
              cotización
            </h3>
            {/* Body text: min 14px for readability */}
            <p
              className="m-0 leading-[1.55]"
              style={{ fontSize: "clamp(14px,1.05vw,20px)", color: "#FFFFFFC7" }}
            >
              Nadie paga por mostrarse, se paga cuando se vende.
            </p>
          </div>
        </div>

        {/* Future callout */}
        <div
          className="flex items-center"
          style={{
            gap: "18px",
            background: "#E6AD1914",
            borderRadius: "24px",
            padding: "clamp(15px,1.5vw,25px) clamp(18px,2vw,32px)",
          }}
        >
          <span
            className="flex-none text-white font-bold uppercase tracking-[.1em]"
            style={{
              background: "#DB8F1B",
              fontSize: "11px",
              padding: "8px 14px",
              borderRadius: "20px",
            }}
          >
            Futuro
          </span>
          <p
            className="m-0 font-medium leading-[1.45]"
            style={{ fontSize: "clamp(14px,1.1vw,21px)", color: "#1E1A49" }}
          >
            Tercera línea futura: inteligencia de mercado e informes de BI.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
