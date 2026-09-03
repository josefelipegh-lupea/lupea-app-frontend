import { SectionShell } from "./SectionShell";

export function Section01Portada() {
  return (
    <SectionShell num="01" label="Lupea" labelFontSize="clamp(24px,2.1vw,40px)">
      <div
        className="flex flex-col"
        style={{ gap: "clamp(16px,2vh,30px)" }}
      >
        {/* Header row: logo + badge */}
        <div className="flex items-center flex-wrap gap-[18px]">
          {/* SVG logo — navy + orange on white bg, ratio preserved via w-auto */}
          <img
            alt="Lupea"
            src="/images/landing/LUPEA_LOGO.svg"
            className="w-auto object-contain block"
            style={{ height: "clamp(52px,4.6vw,74px)" }}
          />
          <span
            className="font-semibold"
            style={{
              background: "#DB8F1B14",
              color: "#DB8F1B",
              fontSize: "clamp(13px,1vw,17px)",
              padding: "11px 20px",
              borderRadius: "20px",
            }}
          >
            Piloto activo en Barquisimeto, Estado Lara
          </span>
        </div>

        {/* H1 */}
        <h1
          className="m-0 font-bold leading-[1.04] tracking-[-0.015em]"
          style={{
            fontSize: "clamp(34px,4.3vw,76px)",
            textWrap: "balance",
            maxWidth: "19ch",
            color: "#1E1A49",
          }}
        >
          Lupea: una solicitud, varias ofertas,{" "}
          <span
            style={{
              background: "linear-gradient(transparent 64%,#E6AD1959 64%)",
            }}
          >
            tú decides
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="m-0 font-normal leading-[1.55]"
          style={{
            fontSize: "clamp(17px,1.35vw,26px)",
            color: "#1E1A49C7",
            maxWidth: "44ch",
          }}
        >
          Ecosistema digital de salud automotriz que conecta conductores con
          proveedores de repuestos.
        </p>

        {/* Tagline */}
        <p
          className="m-0 font-semibold leading-[1.35]"
          style={{ fontSize: "clamp(19px,1.7vw,32px)", maxWidth: "34ch", color: "#1E1A49" }}
        >
          No camines más buscando un repuesto,{" "}
          <span style={{ color: "#DB8F1B" }}>lupéalo</span>.
        </p>

        {/* Footer row */}
        <div
          className="flex items-center flex-wrap"
          style={{
            gap: "16px",
            marginTop: "clamp(6px,2vh,22px)",
            paddingTop: "clamp(14px,2.4vh,28px)",
            borderTop: "1px solid #1E1A491F",
          }}
        >
          <span
            className="text-white font-semibold uppercase tracking-[.08em]"
            style={{
              background: "#1E1A49",
              fontSize: "12px",
              padding: "8px 14px",
              borderRadius: "20px",
            }}
          >
            En producción
          </span>
          <span
            className="font-medium"
            style={{ fontSize: "clamp(14px,1.1vw,21px)", color: "#1E1A49B8" }}
          >
            La app ya está en producción en{" "}
            <a
              href="https://lupea.app"
              style={{ color: "#DB8F1B", textDecoration: "none" }}
            >
              lupea.app
            </a>
            , no es un prototipo.
          </span>
        </div>
      </div>
    </SectionShell>
  );
}
