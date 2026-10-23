"use client";

import { ProgressBar } from "../_shared/ProgressBar";
import { DotsNav } from "../_shared/DotsNav";
import { usePitchDeck } from "../_shared/usePitchDeck";
import { SECTION_LABELS } from "./_components/sections";
import { Section01Portada } from "./_components/Section01Portada";
import { Section02Problema } from "./_components/Section02Problema";
import { Section03Solucion } from "./_components/Section03Solucion";
import { Section04Diferenciacion } from "./_components/Section04Diferenciacion";
import { Section05Modelo } from "./_components/Section05Modelo";
import { Section06Oportunidad } from "./_components/Section06Oportunidad";
import { Section07Equipo } from "./_components/Section07Equipo";

const TOTAL = SECTION_LABELS.length;

export default function PitchPage() {
  const { scrollRef, barRef, activeIndex, goTo } = usePitchDeck(TOTAL);

  return (
    <>
      <ProgressBar barRef={barRef} />
      {/* Dots nav — hidden on mobile (<md), visible on desktop */}
      <DotsNav labels={SECTION_LABELS} activeIndex={activeIndex} goTo={goTo} />

      {/* Scroll container.
          Mobile: scroll-snap proximity so tall sections can be scrolled fully.
          Desktop md+: mandatory snap for crisp slide-to-slide feel.
          pr-0 on mobile (no dots); md:pr-[34px] leaves room for dots nav. */}
      <div
        ref={scrollRef}
        style={{
          height: "100dvh",
          overflowY: "scroll",
          boxSizing: "border-box",
          color: "#1E1A49",
          background: "#fff",
          scrollbarWidth: "none",
        }}
        className={[
          "[scroll-snap-type:y_proximity] md:[scroll-snap-type:y_mandatory]",
          "pr-0 md:pr-[34px]",
          "[&::-webkit-scrollbar]:hidden",
        ].join(" ")}
      >
        <Section01Portada />
        <Section02Problema />
        <Section03Solucion />
        <Section04Diferenciacion />
        <Section05Modelo />
        <Section06Oportunidad />
        <Section07Equipo />
      </div>
    </>
  );
}
