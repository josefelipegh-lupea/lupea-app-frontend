import { RefObject } from "react";

interface ProgressBarProps {
  barRef: RefObject<HTMLDivElement | null>;
}

export function ProgressBar({ barRef }: ProgressBarProps) {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] h-[3px]"
      style={{ background: "#1E1A4914" }}
    >
      <div
        ref={barRef}
        className="h-full w-0"
        style={{
          background: "linear-gradient(90deg,#DB8F1B,#E6AD19)",
          transition: "width .12s linear",
        }}
      />
    </div>
  );
}
