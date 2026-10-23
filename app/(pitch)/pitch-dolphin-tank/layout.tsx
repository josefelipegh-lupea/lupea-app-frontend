import type { Metadata } from "next";
import { poppins } from "../_shared/fonts";

export const metadata: Metadata = {
  title: "Lupea — Pitch Dolphin Tank",
  robots: { index: false, follow: false },
};

export default function PitchDolphinTankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={poppins.className}>{children}</div>;
}
