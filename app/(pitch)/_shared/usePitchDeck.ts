"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Full-screen deck behaviour shared by the pitch routes: keyboard nav,
 * scroll tracking, progress bar and the lupRise entrance animation.
 * Sections must carry `data-pitch-section`; the animated body is children[1].
 */
export function usePitchDeck(total: number) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  const goTo = useCallback((i: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const sections = el.querySelectorAll<HTMLElement>("[data-pitch-section]");
    const target = sections[i];
    if (!target) return;
    el.scrollTo({
      top: target.offsetTop - el.offsetTop,
      behavior: reducedMotion.current ? "auto" : "smooth",
    });
  }, []);

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
      const prev = activeRef.current;
      const target =
        d === -99 ? 0 : d === 99 ? total - 1 : Math.min(total - 1, Math.max(0, prev + d));
      goTo(target);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo, total]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => {
      const h = el.clientHeight || 1;
      const sections = el.querySelectorAll<HTMLElement>("[data-pitch-section]");
      let i = 0;
      sections.forEach((s, n) => {
        if (s.offsetTop - el.offsetTop <= el.scrollTop + h * 0.4) i = n;
      });
      if (i < total) {
        activeRef.current = i;
        setActiveIndex(i);
      }
      const max = el.scrollHeight - h;
      if (barRef.current) {
        barRef.current.style.width =
          (max > 0 ? (el.scrollTop / max) * 100 : 0) + "%";
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, [total]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !("IntersectionObserver" in window)) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
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

    el.querySelectorAll("[data-pitch-section]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  return { scrollRef, barRef, activeIndex, goTo };
}
