interface DotsNavProps {
  labels: readonly string[];
  activeIndex: number;
  goTo: (i: number) => void;
  size?: "md" | "lg";
}

const SIZES = {
  md: {
    nav: "right-[26px] gap-[16px]",
    label: "13px",
    labelPad: "6px 13px",
    dotW: "11px",
    dotH: "26px",
  },
  lg: {
    nav: "right-[22px] gap-[18px]",
    label: "18px",
    labelPad: "6px 14px",
    dotW: "12px",
    dotH: "30px",
  },
} as const;

export function DotsNav({ labels, activeIndex, goTo, size = "md" }: DotsNavProps) {
  const s = SIZES[size];
  return (
    // hidden on mobile; flex on md+ (desktop/tablet)
    <nav
      className={`hidden md:flex fixed top-1/2 -translate-y-1/2 z-[60] flex-col items-end ${s.nav}`}
      aria-label="Navegación de secciones"
    >
      {labels.map((label, n) => {
        const isActive = n === activeIndex;
        return (
          <button
            key={n}
            onClick={() => goTo(n)}
            title={label}
            className="flex items-center gap-[10px] border-none bg-transparent p-0 cursor-pointer"
          >
            {/* Label pill — visible only when active */}
            <span
              aria-hidden={!isActive}
              className="motion-reduce:transition-none"
              style={{
                fontFamily: "inherit",
                fontSize: s.label,
                fontWeight: 600,
                whiteSpace: "nowrap",
                transition: "opacity .3s cubic-bezier(0.25,0.8,0.25,1)",
                color: "#1E1A49",
                background: "#fff",
                border: "1px solid #1E1A491F",
                boxShadow: "0 4px 14px rgba(30,26,73,.10)",
                borderRadius: "20px",
                padding: s.labelPad,
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? undefined : "none",
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              className="motion-reduce:transition-none"
              style={{
                display: "block",
                borderRadius: "20px",
                transition: "all .3s cubic-bezier(0.25,0.8,0.25,1)",
                width: s.dotW,
                height: isActive ? s.dotH : s.dotW,
                background: isActive ? "#DB8F1B" : "#1E1A4933",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
