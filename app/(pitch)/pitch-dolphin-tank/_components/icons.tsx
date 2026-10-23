// Lucide paths copied verbatim from the design so strokes match exactly.
const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

export function CarIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function StoreIcon({ className }: { className?: string }) {
  return (
    <svg {...svgProps} className={className}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

/**
 * Lupea glyph (orange pin). Same geometry as public/icon.svg, placed on the
 * 1426×504 canvas of the design's lupea-glyph.png so size and offset match.
 */
export function LupeaGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1426 504"
      aria-hidden
      className={`aspect-[1426/504] ${className ?? ""}`}
    >
      <path
        className="fill-pitch-orange"
        transform="translate(226.3 -172.2) scale(1.697)"
        d="M250,106.2c-59.1,0-107.3,46.3-110.4,104.6l-0.2-0.1v183l77-71.6c10.6,3.4,21.9,5.2,33.6,5.2c61.1,0,110.5-49.5,110.5-110.5S311.1,106.2,250,106.2z M318.2,257.5c-22.5,37.7-71.3,50-109,27.5c-37.7-22.5-50-71.3-27.5-109c15.8-26.5,44.6-40.4,73.4-38.6l17.3,3c6.3,1.9,12.4,4.5,18.3,8C328.4,171,340.7,219.8,318.2,257.5z"
      />
    </svg>
  );
}

/**
 * Landing logo (public/images/landing/LUPEA_LOGO.svg) cropped to its artwork.
 * The SVG carries padding inside its 967×514 viewBox; the artwork bbox is
 * x145.2 y140.1 w677.2 h234.5. Set the visible height via className.
 */
export function LupeaLogo({ className }: { className: string }) {
  return (
    <span
      role="img"
      aria-label="Lupea"
      className={`relative block overflow-hidden aspect-[677.2/234.5] ${className}`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/landing/LUPEA_LOGO.svg"
        alt=""
        className="absolute max-w-none w-[142.79%] h-[219.19%] left-[-21.44%] top-[-59.74%]"
      />
    </span>
  );
}
