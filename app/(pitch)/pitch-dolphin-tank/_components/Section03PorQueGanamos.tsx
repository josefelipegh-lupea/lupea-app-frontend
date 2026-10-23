import { DeckSection } from "./DeckSection";
import { LupeaLogo } from "./icons";

const EYEBROW =
  "text-[clamp(15px,.96vw,19px)] md:text-[clamp(18px,.96vw,19px)] font-bold tracking-[.1em] uppercase text-pitch-navy/70";
const CHIP =
  "self-start text-[clamp(15px,.96vw,19px)] md:text-[clamp(18px,.96vw,19px)] font-bold px-4 py-[7px] rounded-[20px]";
const MODEL_CARD =
  "rounded-[28px] p-[clamp(14px,min(1.7vw,3vh),34px)] flex flex-col gap-[clamp(6px,1.1vh,12px)]";
const MODEL_TEXT = "m-0 text-[clamp(18px,1.15vw,23px)] leading-[1.45] text-pitch-navy/80";
const MEMBER_ROLE =
  "text-[clamp(16px,1vw,20px)] md:text-[clamp(18px,1vw,20px)] leading-[1.35] text-pitch-navy/80";
const LINK =
  "text-pitch-navy underline decoration-pitch-orange underline-offset-4 hover:text-pitch-orange";

const TEAM = [
  { name: "Josué Vielma", role: "Founder, finanzas" },
  { name: "Claudia Gelli", role: "Reglas de negocio" },
  { name: "Felipe Gonzalez", role: "Tecnología" },
  { name: "Asdrúbal Gómez", role: "Legal" },
  { name: "Liliana Nolazco", role: "Mercadeo y networking" },
  { name: "Griselys Barrios", role: "Marketing digital y comunicación" },
];

const ASKS = [
  "Conexiones con tiendas de repuestos y talleres de la Cámara",
  "Mentoría en finanzas y costos",
  "Inversión para cerrar el triángulo",
];

export function Section03PorQueGanamos() {
  return (
    <DeckSection
      num="03"
      title="Por qué ganamos y qué pedimos"
      bodyClassName="gap-[clamp(10px,2.4vh,36px)] px-[6px] pt-7 pb-10 md:p-[clamp(8px,2.4vh,48px)_clamp(24px,3.6vw,76px)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] gap-[clamp(20px,2.4vw,48px)] items-stretch">
        <div className="flex flex-col gap-[clamp(10px,2.6vh,40px)] min-w-0">
          {/* Modelo de negocio */}
          <div className="flex flex-col gap-[clamp(6px,1.4vh,18px)]">
            <span className={EYEBROW}>Modelo de negocio</span>
            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)] gap-[clamp(14px,1.4vw,28px)]">
              <div className={`${MODEL_CARD} border-2 border-pitch-navy/12`}>
                <span className={`${CHIP} bg-pitch-chip text-pitch-navy`}>Conductor</span>
                <h3 className="m-0 text-[clamp(21px,1.55vw,30px)] font-bold leading-[1.25] text-balance">
                  Cinco lupas gratis al mes.
                </h3>
                <p className={MODEL_TEXT}>Ingreso marginal a propósito.</p>
              </div>
              <div
                className={`${MODEL_CARD} border-2 border-pitch-orange bg-pitch-amber/6`}
              >
                <span className={`${CHIP} bg-pitch-orange text-pitch-navy`}>
                  Tienda aliada
                </span>
                <h3 className="m-0 text-[clamp(21px,1.55vw,30px)] font-bold leading-[1.25]">
                  Pay per match.
                </h3>
                <p className={`${MODEL_TEXT} text-pretty`}>
                  Paga solo cuando el cliente acepta su oferta.
                </p>
                <p className="m-0 text-[clamp(18px,1.2vw,24px)] leading-[1.4] font-semibold text-pretty">
                  “No es un gasto de publicidad, es un costo por venta cerrada.”
                </p>
              </div>
            </div>
          </div>

          {/* Equipo */}
          <div className="flex flex-col gap-[clamp(6px,1.4vh,18px)]">
            <span className={EYEBROW}>Equipo</span>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-[clamp(14px,1.6vw,32px)] gap-y-[clamp(8px,1.6vh,22px)]">
              {TEAM.map(({ name, role }, i) => (
                <div
                  key={name}
                  className={`flex flex-col gap-[2px] border-t-2 pt-[clamp(5px,.9vh,10px)] ${
                    i === 0 ? "border-pitch-orange" : "border-pitch-navy/12"
                  }`}
                >
                  <span className="text-[clamp(18px,1.25vw,24px)] font-bold leading-[1.25]">
                    {name}
                  </span>
                  <span className={MEMBER_ROLE}>{role}</span>
                </div>
              ))}
            </div>
            <p className="m-0 mt-[clamp(2px,.6vh,6px)] text-[clamp(19px,1.35vw,26px)] leading-[1.35] font-semibold">
              No tercerizamos ninguna función crítica.
            </p>
          </div>
        </div>

        {/* Lo que pedimos */}
        <div className="rounded-[36px] bg-linear-155/srgb from-pitch-navy to-pitch-plum p-[clamp(18px,min(2.4vw,4vh),48px)] flex flex-col justify-center gap-[clamp(10px,2.4vh,34px)] shadow-[0_14px_40px] shadow-pitch-navy/22">
          <h2 className="m-0 text-white text-[clamp(24px,2vw,40px)] leading-[1.2] font-bold text-balance">
            Vinimos a Dolphin Tank por tres cosas:
          </h2>
          <div className="flex flex-col">
            {ASKS.map((text, i) => (
              <div
                key={text}
                className="flex gap-[clamp(14px,1.2vw,22px)] items-baseline py-[clamp(8px,2vh,24px)] border-t border-white/15"
              >
                <span className="flex-none text-pitch-amber font-bold text-[clamp(28px,2.2vw,44px)] leading-none min-w-[1.1ch]">
                  {i + 1}
                </span>
                <span className="text-white text-[clamp(19px,1.4vw,27px)] leading-[1.35] font-medium text-pretty">
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-7 gap-y-4 pt-[clamp(8px,1.8vh,24px)] border-t border-pitch-navy/12">
        <LupeaLogo className="h-[clamp(34px,2.4vw,48px)]" />
        <span className="text-[clamp(17px,1.1vw,22px)] md:text-[clamp(18px,1.1vw,22px)] font-medium text-pitch-navy/80">
          Una solicitud, varias ofertas, tú decides ·{" "}
          <a href="https://lupea.app" className={LINK}>
            lupea.app
          </a>
        </span>
      </div>
    </DeckSection>
  );
}
