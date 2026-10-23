import { DeckSection } from "./DeckSection";
import { LupeaGlyph, StoreIcon, WrenchIcon } from "./icons";

const EYEBROW =
  "text-[clamp(15px,.96vw,19px)] md:text-[clamp(18px,.96vw,19px)] font-bold tracking-[.08em] uppercase";
const BADGE = `${EYEBROW} inline-flex items-center gap-[10px] px-[18px] py-[9px] rounded-[20px] border-2`;
const STEP_CIRCLE =
  "flex-none size-[clamp(44px,3vw,58px)] rounded-full box-border font-bold text-[clamp(18px,1.2vw,24px)] flex items-center justify-center";
const CARD =
  "flex-1 rounded-[28px] p-[clamp(16px,min(1.9vw,3.4vh),38px)] flex flex-col gap-[clamp(8px,1.3vh,14px)] box-border";
const CARD_ICON = "size-[clamp(34px,2.4vw,46px)]";
const CARD_TITLE = "m-0 text-[clamp(24px,1.8vw,36px)] font-bold leading-[1.15]";
const CARD_TEXT = "m-0 text-[clamp(18px,1.25vw,25px)] leading-[1.45] text-pretty";
const STATUS_LABEL = "text-[clamp(18px,1.2vw,24px)] font-semibold";
const LINK =
  "text-pitch-navy underline decoration-pitch-orange underline-offset-4 hover:text-pitch-orange";

export function Section02Viaje() {
  return (
    <DeckSection
      num="02"
      title="El viaje y dónde estamos"
      bodyClassName="gap-[clamp(14px,3.6vh,52px)] px-[6px] pt-7 pb-10 md:p-[clamp(10px,3vh,56px)_clamp(24px,3.6vw,76px)]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(18px,1.8vw,36px)]">
        {/* 1 — Lupita · En alfa */}
        <div className="flex flex-col gap-[clamp(8px,1.8vh,24px)]">
          <div className="flex items-center gap-[14px]">
            <span className={`${STEP_CIRCLE} bg-pitch-navy text-white`}>1</span>
            <span className="max-md:hidden flex-1 h-[3px] rounded-[3px] bg-pitch-navy/15" />
          </div>
          <div className={`${CARD} border-2 border-pitch-navy/15`}>
            <LupeaGlyph className="h-[clamp(34px,2.4vw,46px)] w-auto self-start" />
            <h3 className={CARD_TITLE}>Lupita</h3>
            <p className={`${CARD_TEXT} text-pitch-navy/80`}>
              Prediagnóstico en lenguaje llano.
            </p>
          </div>
          <div className="flex flex-col gap-[10px] items-start">
            <span className={`${BADGE} bg-pitch-amber/20 border-pitch-amber text-pitch-navy`}>
              En alfa
            </span>
            <span className={STATUS_LABEL}>Lupita</span>
          </div>
        </div>

        {/* 2 — Taller · Siguiente fase */}
        <div className="flex flex-col gap-[clamp(8px,1.8vh,24px)]">
          <div className="flex items-center gap-[14px]">
            <span
              className={`${STEP_CIRCLE} bg-white border-2 border-dashed border-pitch-navy/50 text-pitch-navy/70`}
            >
              2
            </span>
            <span className="max-md:hidden flex-1 h-0 border-t-[3px] border-dashed border-pitch-navy/20" />
          </div>
          <div
            className={`${CARD} border-2 border-dashed border-pitch-navy/40 bg-pitch-mist`}
          >
            <WrenchIcon className={`${CARD_ICON} stroke-pitch-navy/70`} />
            <h3 className={`${CARD_TITLE} text-pitch-navy/80`}>Taller</h3>
            <p className={`${CARD_TEXT} text-pitch-navy/70`}>
              El carro llega con contexto y se diagnostica más rápido.
            </p>
          </div>
          <div className="flex flex-col gap-[10px] items-start">
            <span
              className={`${BADGE} bg-transparent border-dashed border-pitch-navy/50 text-pitch-navy/70`}
            >
              Siguiente fase
            </span>
            <span className={`${STATUS_LABEL} text-pitch-navy/70`}>
              Conductor ↔ Taller
            </span>
          </div>
        </div>

        {/* 3 — Repuestos · En producción */}
        <div className="flex flex-col gap-[clamp(8px,1.8vh,24px)]">
          <div className="flex items-center gap-[14px]">
            <span className={`${STEP_CIRCLE} bg-pitch-orange text-white`}>3</span>
          </div>
          <div
            className={`${CARD} bg-linear-150/srgb from-pitch-navy to-pitch-plum shadow-[0_10px_30px] shadow-pitch-navy/18`}
          >
            <StoreIcon className={`${CARD_ICON} stroke-pitch-amber`} />
            <h3 className={`${CARD_TITLE} text-white`}>Repuestos</h3>
            <p className={`${CARD_TEXT} text-white/90`}>
              Una sola solicitud, varias ofertas comparadas, tú decides.
            </p>
          </div>
          <div className="flex flex-col gap-[10px] items-start">
            <span className={`${BADGE} bg-pitch-navy border-pitch-navy text-white`}>
              <span className="size-[10px] rounded-full bg-pitch-mint motion-safe:animate-lup-pulse" />
              En producción
            </span>
            <span className={STATUS_LABEL}>Conductor ↔ Tienda</span>
            <span className="text-[clamp(16px,1vw,20px)] md:text-[clamp(18px,1vw,20px)] leading-[1.4] text-pitch-navy/80">
              <a href="https://lupea.app" className={LINK}>
                lupea.app
              </a>{" "}
              · piloto activo en Barquisimeto
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-pitch-navy/12 pt-[clamp(8px,2.4vh,30px)]">
        <p className="m-0 text-[clamp(21px,1.75vw,34px)] leading-[1.35] font-semibold text-balance">
          <span className="font-bold bg-linear-180/srgb from-transparent from-62% to-pitch-amber/40 to-62%">
            Primero flujo de caja con las tiendas.
          </span>{" "}
          Con eso e inversión, cerramos el triángulo.
        </p>
      </div>
    </DeckSection>
  );
}
