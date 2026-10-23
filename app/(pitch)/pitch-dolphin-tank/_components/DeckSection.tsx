import { ReactNode } from "react";

interface DeckSectionProps {
  num: string;
  title: string;
  bodyClassName: string;
  children: ReactNode;
}

// The body is children[1]: usePitchDeck animates it with lupRise on entry.
// Mobile: aside becomes a horizontal bar on top. md+: vertical panel on the left.
export function DeckSection({ num, title, bodyClassName, children }: DeckSectionProps) {
  return (
    <section
      data-pitch-section
      className="flex flex-col md:flex-row box-border bg-white min-h-[100dvh] md:h-[100dvh] p-3 md:p-[clamp(12px,2.4vh,26px)] [scroll-snap-align:start]"
    >
      <aside className="flex-none flex box-border flex-row items-center justify-start gap-[14px] px-4 py-3 rounded-[28px] bg-linear-165/srgb from-pitch-navy to-pitch-plum md:flex-col md:justify-between md:gap-0 md:w-[clamp(120px,9.4vw,180px)] md:rounded-[40px] md:px-0 md:py-[34px]">
        <span className="flex-none size-[52px] rounded-full bg-pitch-orange text-white font-bold text-[20px] flex items-center justify-center">
          {num}
        </span>
        <span className="text-white font-bold tracking-[.01em] text-[19px] leading-[1.25] md:leading-normal md:text-[clamp(24px,1.9vw,38px)] md:[writing-mode:vertical-rl] md:rotate-180">
          {title}
        </span>
        <span className="flex-none size-[9px] rounded-full bg-pitch-amber ml-auto md:ml-0" />
      </aside>

      <div className={`flex-1 min-w-0 flex flex-col justify-start md:justify-center ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
