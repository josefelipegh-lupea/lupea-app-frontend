import { SectionShell } from "./SectionShell";

export function Section04Diferenciacion() {
  const items = [
    {
      num: "01",
      title: "Transparencia por comparación",
      body: "El mercado se delata solo cuando ves varias ofertas juntas.",
    },
    {
      num: "02",
      title: "Tres capas de confianza",
      body: "Comparación, reputación visible por estrellas, pertenencia a la Red Lupea.",
    },
    {
      num: "03",
      title: "Lupita nivela, no protagoniza",
      body: "Nivela la asimetría de conocimiento, pero es respaldo y no titular: la tecnología es el cómo, nunca el qué.",
    },
    {
      num: "04",
      title: "Categoría desde el lenguaje",
      body: "Lupear es verbo propio de marca.",
    },
    {
      num: "05",
      title: "Foco geográfico deliberado",
      body: "Dominar Barquisimeto y Cabudare antes de escalar.",
    },
  ];

  return (
    <SectionShell
      num="04"
      label="Diferenciación y Ventajas"
      labelFontSize="clamp(20px,1.75vw,33px)"
    >
      <div className="flex flex-col" style={{ gap: "clamp(18px,2.6vh,36px)" }}>
        {/* Responsive grid: 1 col mobile → 2 col sm → 3 col lg */}
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{ gap: "clamp(14px,1.7vw,34px) clamp(18px,2.2vw,44px)" }}
        >
          {items.map((item) => (
            <div key={item.num} className="flex flex-col" style={{ gap: "10px" }}>
              <span
                className="font-bold leading-[1]"
                style={{ fontSize: "clamp(20px,1.7vw,32px)", color: "#E6AD19" }}
              >
                {item.num}
              </span>
              <h3
                className="m-0 font-bold leading-[1.25]"
                style={{ fontSize: "clamp(15px,1.25vw,23px)", color: "#1E1A49" }}
              >
                {item.title}
              </h3>
              {/* Body text: min 14px for readability */}
              <p
                className="m-0 leading-[1.5]"
                style={{ fontSize: "clamp(14px,1vw,18px)", color: "#1E1A49BF" }}
              >
                {item.body}
              </p>
            </div>
          ))}

          {/* "Lo que no somos" card — occupies the 6th cell */}
          <div
            className="flex flex-col justify-center"
            style={{
              gap: "10px",
              background: "linear-gradient(150deg,#1E1A49,#4C1952)",
              borderRadius: "28px",
              padding: "clamp(16px,1.7vw,30px)",
            }}
          >
            <span
              className="font-bold uppercase tracking-[.12em]"
              style={{ fontSize: "11px", color: "#E6AD19" }}
            >
              Lo que no somos
            </span>
            <p
              className="m-0 text-white font-semibold leading-[1.35]"
              style={{ fontSize: "clamp(14px,1.2vw,22px)" }}
            >
              No somos un intermediario que se queda con la información.
            </p>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
