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
    // Mobile: flex-col (aside becomes top bar). Desktop md+: flex-row (aside = left column).
    // min-h-[100dvh] lets tall sections grow; md:h-[100dvh] locks height on desktop.
    <section
      data-pitch-section
      className="flex flex-col md:flex-row box-border bg-white min-h-[100dvh] md:h-[100dvh] p-4 md:p-[26px]"
      style={{ scrollSnapAlign: "start" }}
    >
      {/* Aside — horizontal bar on mobile, vertical panel on md+ */}
      <aside
        className={[
          "flex-none flex box-border",
          // Mobile: horizontal row, full width, compact height
          "flex-row items-center justify-between w-full rounded-[24px] px-4 py-3",
          // Desktop: vertical column, fixed width, tall
          "md:flex-col md:items-center md:justify-between md:w-[clamp(120px,11vw,190px)] md:rounded-[40px] md:px-0 md:py-[34px]",
        ].join(" ")}
        style={{ background: "linear-gradient(165deg,#1E1A49 0%,#4C1952 100%)" }}
      >
        {/* Number badge */}
        <span
          className="flex items-center justify-center text-white font-bold flex-none"
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "#DB8F1B",
            fontSize: "17px",
          }}
        >
          {num}
        </span>

        {/* Label — horizontal on mobile, vertical on md+ */}
        <span
          className={[
            "text-white font-bold tracking-[.02em]",
            // Mobile: normal horizontal text
            "[writing-mode:horizontal-tb]",
            // Desktop: vertical rotated
            "md:[writing-mode:vertical-rl] md:[transform:rotate(180deg)]",
          ].join(" ")}
          style={{ fontSize: labelFontSize }}
        >
          {label}
        </span>

        {/* Amber dot — hidden on mobile (not enough room), visible md+ */}
        <span
          className="hidden md:block"
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: "#E6AD19",
          }}
        />
      </aside>

      {/* Section body — receives lupRise via IntersectionObserver */}
      {/* justify-start on mobile (content at top), justify-center on desktop */}
      <div
        className="flex-1 min-w-0 flex flex-col justify-start md:justify-center p-5 md:p-[clamp(26px,3.4vw,72px)]"
      >
        {children}
      </div>
    </section>
  );
}
