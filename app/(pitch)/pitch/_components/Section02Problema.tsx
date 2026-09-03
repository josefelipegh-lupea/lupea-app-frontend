import { SectionShell } from "./SectionShell";

export function Section02Problema() {
  const cards = [
    {
      num: "01",
      title: "",
      body: "Asimetría de conocimiento: el conductor no sabe qué tiene su carro ni qué repuesto pedir, y eso lo deja a merced del mecánico.",
    },
    {
      num: "02",
      title: "",
      body: "Pierde el día recorriendo de tienda en tienda.",
    },
    {
      num: "03",
      title: "",
      body: "Llama a veinte proveedores sin saber si el precio es justo. Está en emergencia, y esa urgencia lo hace vulnerable.",
    },
  ];

  return (
    <SectionShell
      num="02"
      label="El Problema"
      labelFontSize="clamp(22px,1.9vw,36px)"
    >
      <div className="flex flex-col" style={{ gap: "clamp(20px,3.2vh,44px)" }}>
        <p
          className="m-0 font-semibold leading-[1.3]"
          style={{
            fontSize: "clamp(18px,1.9vw,36px)",
            maxWidth: "32ch",
            color: "#1E1A49",
          }}
        >
          ¿No sabe qué pedir? ¿Pierde tiempo buscándolo? ¿Y siente que lo están
          robando?
        </p>

        {/* Responsive grid: 1 col mobile → 3 col desktop */}
        <div
          className="grid grid-cols-1 md:grid-cols-3"
          style={{ gap: "clamp(14px,1.6vw,30px)" }}
        >
          {cards.map((c) => (
            <div
              key={c.num}
              className="flex flex-col"
              style={{
                border: "1px solid #1E1A491F",
                borderRadius: "28px",
                padding: "clamp(18px,1.8vw,34px)",
                gap: "14px",
              }}
            >
              <span
                className="font-bold uppercase tracking-[.1em]"
                style={{ fontSize: "12px", color: "#DB8F1B" }}
              >
                {c.num}
              </span>
              <h3
                className="m-0 font-bold leading-[1.25]"
                style={{
                  fontSize: "clamp(16px,1.35vw,25px)",
                  color: "#1E1A49",
                }}
              >
                {c.title}
              </h3>
              {/* Body text: min 14px for readability */}
              <p
                className="m-0 leading-[1.55]"
                style={{
                  fontSize: "clamp(14px,1.05vw,19px)",
                  color: "#1E1A49BF",
                }}
              >
                {c.body}
              </p>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div
          className="flex items-center"
          style={{
            gap: "18px",
            background: "#E6AD1914",
            borderRadius: "24px",
            padding: "clamp(16px,1.6vw,26px) clamp(18px,2vw,32px)",
          }}
        >
          <span
            className="flex-none self-stretch"
            style={{ width: "6px", borderRadius: "6px", background: "#DB8F1B" }}
          />
          <p
            className="m-0 font-medium leading-[1.45]"
            style={{ fontSize: "clamp(14px,1.15vw,22px)", color: "#1E1A49" }}
          >
            Del lado proveedor: vende quien está de guardia, no quien tiene
            mejor precio o inventario.
          </p>
        </div>
      </div>
    </SectionShell>
  );
}
