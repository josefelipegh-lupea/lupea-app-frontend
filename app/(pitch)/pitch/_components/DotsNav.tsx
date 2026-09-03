import { SECTION_LABELS } from "./sections";

interface DotsNavProps {
  activeIndex: number;
  goTo: (i: number) => void;
}

export function DotsNav({ activeIndex, goTo }: DotsNavProps) {
  return (
    // hidden on mobile; flex on md+ (desktop/tablet)
    <nav
      className="hidden md:flex fixed right-[26px] top-1/2 -translate-y-1/2 z-[60] flex-col items-end gap-[16px]"
      aria-label="Navegación de secciones"
    >
      {SECTION_LABELS.map((label, n) => {
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
              style={{
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 600,
                whiteSpace: "nowrap",
                transition: "opacity .3s cubic-bezier(0.25,0.8,0.25,1)",
                color: "#1E1A49",
                background: "#fff",
                border: "1px solid #1E1A491F",
                boxShadow: "0 4px 14px rgba(30,26,73,.10)",
                borderRadius: "20px",
                padding: "6px 13px",
                opacity: isActive ? 1 : 0,
                pointerEvents: isActive ? undefined : "none",
              }}
            >
              {label}
            </span>

            {/* Dot */}
            <span
              style={{
                display: "block",
                borderRadius: "20px",
                transition: "all .3s cubic-bezier(0.25,0.8,0.25,1)",
                width: "11px",
                height: isActive ? "26px" : "11px",
                background: isActive ? "#DB8F1B" : "#1E1A4933",
              }}
            />
          </button>
        );
      })}
    </nav>
  );
}
