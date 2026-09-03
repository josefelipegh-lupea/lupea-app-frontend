import { ReactNode } from "react";

interface SectionShellProps {
  num: string;         // "01" .. "07"
  label: string;
  labelFontSize?: string; // e.g. "clamp(20px,1.75vw,33px)" for longer labels
  children: ReactNode; // section body — this is children[1] for IntersectionObserver
}

export function SectionShell({
  num,
  label,
  labelFontSize = "clamp(22px,1.9vw,36px)",
  children,
}: SectionShellProps) {
  return (
    // data-pitch-section used by IO in page.tsx
    <section
      data-pitch-section
      className="flex box-border bg-white"
      style={{
        height: "100vh",
        scrollSnapAlign: "start",
        padding: "26px",
      }}
    >
      {/* Aside — gradient panel */}
      <aside
        className="flex-none flex flex-col items-center justify-between box-border"
        style={{
          width: "clamp(120px,11vw,190px)",
          borderRadius: "40px",
          background: "linear-gradient(165deg,#1E1A49 0%,#4C1952 100%)",
          padding: "34px 0",
        }}
      >
        {/* Number badge */}
        <span
          className="flex items-center justify-center text-white font-bold"
          style={{
            width: "46px",
            height: "46px",
            borderRadius: "50%",
            background: "#DB8F1B",
            fontSize: "19px",
          }}
        >
          {num}
        </span>

        {/* Vertical label */}
        <span
          className="text-white font-bold tracking-[.02em]"
          style={{
            writingMode: "vertical-rl",
            transform: "rotate(180deg)",
            fontSize: labelFontSize,
          }}
        >
          {label}
        </span>

        {/* Amber dot */}
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#E6AD19",
          }}
        />
      </aside>

      {/* Section body — receives lupRise via IntersectionObserver */}
      <div
        className="flex-1 min-w-0 flex flex-col justify-center"
        style={{ padding: "clamp(26px,3.4vw,72px)" }}
      >
        {children}
      </div>
    </section>
  );
}
