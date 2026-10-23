import { DeckSection } from "./DeckSection";
import {
  CarIcon,
  LupeaGlyph,
  LupeaLogo,
  StoreIcon,
  WrenchIcon,
} from "./icons";

const NODE =
  "absolute -translate-1/2 size-[clamp(72px,6vw,116px)] rounded-full bg-pitch-navy flex items-center justify-center ring-8 ring-white";
const NODE_LABEL =
  "absolute font-bold whitespace-nowrap text-[clamp(18px,1.35vw,27px)]";
const ICON = "fill-none stroke-white";

const ACTORS = [
  {
    label: "Conductor",
    text: "No sabe qué tiene su carro",
    Icon: CarIcon,
    iconSize: "size-1/2",
  },
  {
    label: "Taller",
    text: "El taller diagnostica desde cero",
    Icon: WrenchIcon,
    iconSize: "size-[48%]",
  },
  {
    label: "Tienda de repuestos",
    text: "Busca repuestos de tienda en tienda, sin saber si el precio es justo",
    Icon: StoreIcon,
    iconSize: "size-[48%]",
  },
];

export function Section01Triangulo() {
  return (
    <DeckSection
      num="01"
      title="El triángulo"
      bodyClassName="gap-[clamp(12px,2.8vh,40px)] px-[6px] pt-7 pb-10 md:p-[clamp(10px,3vh,56px)_clamp(24px,3.6vw,76px)]"
    >
      <div className="flex flex-col gap-[clamp(8px,2vh,28px)]">
        <LupeaLogo className="h-[clamp(32px,min(3.3vw,5.6vh),64px)] self-start" />
        <h1 className="m-0 text-[clamp(28px,3vw,58px)] leading-[1.12] font-bold tracking-[-.015em] text-balance">
          Tres actores que existen, pero no se hablan.
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] gap-[clamp(28px,4vw,84px)] items-center">
        {/* Diagram */}
        <div className="w-full max-w-full md:max-w-[min(clamp(300px,34vw,660px),calc(100dvh-430px))] min-w-[min(300px,100%)] justify-self-center pb-11 md:pb-5">
          <div className="relative w-full aspect-[600/580]">
            <svg
              viewBox="0 0 600 580"
              aria-hidden
              className="absolute inset-0 size-full overflow-visible"
            >
              <polygon
                points="300,70 70,470 530,470"
                className="fill-pitch-amber/5 stroke-pitch-navy/30"
                strokeWidth={3}
                strokeDasharray="2 14"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                [300, 70],
                [70, 470],
                [530, 470],
              ].map(([x, y]) => (
                <line
                  key={`${x}-${y}`}
                  x1={300}
                  y1={337}
                  x2={x}
                  y2={y}
                  className="stroke-pitch-orange"
                  strokeWidth={4}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            <div className={`${NODE} left-1/2 top-[12.07%]`}>
              <CarIcon className={`${ICON} size-[46%]`} />
            </div>
            <span
              className={`${NODE_LABEL} left-[calc(50%_+_clamp(50px,3.6vw,74px))] top-[12.07%] -translate-y-1/2`}
            >
              Conductor
            </span>

            <div className={`${NODE} left-[11.67%] top-[81.03%]`}>
              <WrenchIcon className={`${ICON} size-[44%]`} />
            </div>
            <span
              className={`${NODE_LABEL} left-[11.67%] top-[calc(81.03%_+_clamp(46px,3.6vw,72px))] -translate-x-1/2`}
            >
              Taller
            </span>

            <div className={`${NODE} left-[88.33%] top-[81.03%]`}>
              <StoreIcon className={`${ICON} size-[44%]`} />
            </div>
            <span
              className={`${NODE_LABEL} left-[88.33%] top-[calc(81.03%_+_clamp(46px,3.6vw,72px))] -translate-x-1/2 text-center max-md:left-auto max-md:right-0 max-md:translate-x-0 max-md:whitespace-normal max-md:text-right max-md:w-[6em] max-md:leading-[1.2]`}
            >
              Tienda de repuestos
            </span>

            <div className="absolute left-1/2 top-[58.1%] -translate-1/2 size-[clamp(104px,8.4vw,164px)] rounded-full bg-white border-4 border-pitch-orange box-border shadow-[0_10px_30px] shadow-pitch-navy/14 flex flex-col items-center justify-center gap-1">
              <LupeaGlyph className="h-[38%] w-auto block" />
              <span className="text-[clamp(16px,1.2vw,24px)] md:text-[clamp(18px,1.2vw,24px)] font-bold leading-[1.1]">
                Lupita
              </span>
            </div>
          </div>
        </div>

        {/* Actors */}
        <div className="flex flex-col">
          {ACTORS.map(({ label, text, Icon, iconSize }, i) => (
            <div
              key={label}
              className={`flex gap-[clamp(14px,1.2vw,24px)] items-start py-[clamp(8px,2.2vh,28px)] ${
                i < ACTORS.length - 1 ? "border-b border-pitch-navy/12" : ""
              }`}
            >
              <span className="flex-none size-[clamp(44px,3vw,58px)] rounded-full border-2 border-pitch-navy/15 box-border flex items-center justify-center">
                <Icon className={`${iconSize} stroke-pitch-navy`} />
              </span>
              <div className="flex flex-col gap-[6px] min-w-0">
                <span className="text-[clamp(15px,.96vw,19px)] md:text-[clamp(18px,.96vw,19px)] font-bold tracking-[.08em] uppercase text-pitch-navy/70">
                  {label}
                </span>
                <p className="m-0 text-[clamp(20px,1.6vw,31px)] leading-[1.3] font-semibold text-pretty">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-pitch-navy/12 pt-[clamp(8px,2.4vh,30px)]">
        <p className="m-0 text-[clamp(21px,1.75vw,34px)] leading-[1.35] font-semibold text-balance">
          <span className="font-bold bg-linear-180/srgb from-transparent from-62% to-pitch-amber/40 to-62%">
            Lupea: ecosistema de salud automotriz.
          </span>{" "}
          Del problema a la pieza instalada.
        </p>
      </div>
    </DeckSection>
  );
}
