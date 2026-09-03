import { SectionShell } from "./SectionShell";

const TEAM = [
  {
    name: "Josué Vielma",
    role: "Founder",
    bio: "Ideó Lupea. Experto en finanzas.",
  },
  {
    name: "Claudia Gelli",
    role: "Co-creadora del concepto",
    bio: "Reglas de negocio.",
  },
  {
    name: "Felipe Gonzalez",
    role: "Ing. en Informática",
    bio: "Tecnología y desarrollo.",
  },
  {
    name: "Asdrúbal Gómez",
    role: "Socio abogado",
    bio: "Estructura legal.",
  },
  {
    name: "Liliana Nolazco",
    role: "Publicidad y mercadeo",
    bio: "Lanzamiento y networking.",
  },
  {
    name: "Griselys Barrios",
    role: "Marketing digital y comunicación",
    bio: null,
  },
];

export function Section07Equipo() {
  return (
    <SectionShell num="07" label="Equipo y Magia" labelFontSize="clamp(22px,1.9vw,36px)">
      <div className="flex flex-col" style={{ gap: "clamp(14px,2.2vh,30px)" }}>
        {/* Team grid */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "clamp(10px,1.2vw,24px)",
          }}
        >
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="flex flex-col"
              style={{
                border: "1px solid #1E1A491F",
                borderRadius: "24px",
                padding: "clamp(14px,1.5vw,26px)",
                gap: "7px",
              }}
            >
              <h3
                className="m-0 font-bold leading-[1.2]"
                style={{ fontSize: "clamp(14px,1.2vw,23px)", color: "#1E1A49" }}
              >
                {member.name}
              </h3>
              <span
                className="font-semibold"
                style={{ fontSize: "clamp(11px,.9vw,16px)", color: "#DB8F1B" }}
              >
                {member.role}
              </span>
              {member.bio && (
                <p
                  className="m-0 leading-[1.5]"
                  style={{ fontSize: "clamp(11px,.95vw,17px)", color: "#1E1A49BF" }}
                >
                  {member.bio}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Highlight block */}
        <div
          className="flex flex-col"
          style={{
            borderRadius: "32px",
            background: "linear-gradient(150deg,#1E1A49,#4C1952)",
            padding: "clamp(18px,2vw,34px) clamp(20px,2.4vw,40px)",
            gap: "10px",
          }}
        >
          <p
            className="m-0 text-white font-semibold leading-[1.4]"
            style={{ fontSize: "clamp(14px,1.3vw,25px)", maxWidth: "62ch" }}
          >
            Finanzas, legal, comunicación, mercadeo, tecnología y reglas de negocio
            están dentro del equipo. No tercerizamos ninguna función crítica.
          </p>
          <p
            className="m-0 font-semibold leading-[1.4]"
            style={{ fontSize: "clamp(13px,1.1vw,21px)", color: "#E6AD19" }}
          >
            Por eso Lupea ya está en producción y no en una carpeta de Figma.
          </p>
        </div>

        {/* Footer row */}
        <div
          className="flex items-center justify-between flex-wrap"
          style={{
            gap: "20px",
            paddingTop: "clamp(8px,1.4vh,18px)",
            borderTop: "1px solid #1E1A491F",
          }}
        >
          <div
            className="flex items-center justify-center text-center font-medium uppercase tracking-[.06em] box-border"
            style={{
              width: "clamp(110px,9vw,150px)",
              height: "clamp(40px,3.4vw,56px)",
              border: "1.5px dashed #1E1A4940",
              borderRadius: "16px",
              color: "#1E1A4966",
              fontSize: "10px",
              padding: "0 8px",
            }}
          >
            Espacio logo
          </div>
          <span
            className="font-medium"
            style={{ fontSize: "clamp(12px,1vw,18px)", color: "#1E1A4999" }}
          >
            Una solicitud, varias ofertas, tú decides ·{" "}
            <a
              href="https://lupea.app"
              style={{ color: "#DB8F1B", textDecoration: "none" }}
            >
              lupea.app
            </a>
          </span>
        </div>
      </div>
    </SectionShell>
  );
}
