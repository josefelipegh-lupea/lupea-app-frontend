"use client";

import { ProgressBar } from "../_shared/ProgressBar";
import { DotsNav } from "../_shared/DotsNav";
import { usePitchDeck } from "../_shared/usePitchDeck";
import { SECTION_LABELS } from "./_components/sections";
import { Section01Triangulo } from "./_components/Section01Triangulo";
import { Section02Viaje } from "./_components/Section02Viaje";
import { Section03PorQueGanamos } from "./_components/Section03PorQueGanamos";

export default function PitchDolphinTankPage() {
  const { scrollRef, barRef, activeIndex, goTo } = usePitchDeck(
    SECTION_LABELS.length
  );

  return (
    <>
      <ProgressBar barRef={barRef} heightClass="h-1" />
      <DotsNav
        size="lg"
        labels={SECTION_LABELS}
        activeIndex={activeIndex}
        goTo={goTo}
      />

      {/* Mobile: proximity snap so tall sections scroll fully. Desktop md+: mandatory snap. */}
      <div
        ref={scrollRef}
        className={[
          "h-[100dvh] overflow-y-scroll box-border bg-white text-pitch-navy [scrollbar-width:none]",
          "[scroll-snap-type:y_proximity] md:[scroll-snap-type:y_mandatory]",
          "pr-0 md:pr-[44px]",
          "[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        <Section01Triangulo />
        <Section02Viaje />
        <Section03PorQueGanamos />
      </div>
    </>
  );
}
