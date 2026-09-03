"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProgressBar } from "./_components/ProgressBar";
import { DotsNav } from "./_components/DotsNav";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  // Detect prefers-reduced-motion once on mount
  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const goTo = useCallback((i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: i * el.clientHeight,
      behavior: reducedMotion.current ? "auto" : "smooth",
    });
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      let d = 0;
      if (k === "ArrowDown" || k === "ArrowRight" || k === "PageDown" || k === " ")
        d = 1;
      else if (k === "ArrowUp" || k === "ArrowLeft" || k === "PageUp") d = -1;
      else if (k === "Home") d = -99;
      else if (k === "End") d = 99;
      else return;
      e.preventDefault();
      setActiveIndex((prev) => {
        const target =
          d === -99 ? 0 : d === 99 ? TOTAL - 1 : Math.min(TOTAL - 1, Math.max(0, prev + d));
        goTo(target);
        return target;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  // Scroll tracking + progress bar
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const h = el.clientHeight || 1;
      const i = Math.round(el.scrollTop / h);
      if (i >= 0 && i < TOTAL) setActiveIndex(i);
      const max = el.scrollHeight - h;
      if (barRef.current) {
        barRef.current.style.width =
          (max > 0 ? (el.scrollTop / max) * 100 : 0) + "%";
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver — lupRise animation per section
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // The section body is the 2nd child of each [data-pitch-section]
          const body = entry.target.children[1] as HTMLElement | undefined;
          if (body && !body.dataset.seen && !reducedMotion.current) {
            body.dataset.seen = "1";
            body.style.animation =
              "lupRise .62s cubic-bezier(0.25,0.8,0.25,1) both";
          }
        });
      },
      { threshold: 0.35, root: el }
    );

    const sections = el.querySelectorAll("[data-pitch-section]");
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <ProgressBar barRef={barRef} />
      {/* Dots nav — hidden on mobile (<md), visible on desktop */}
      <DotsNav activeIndex={activeIndex} goTo={goTo} />

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
