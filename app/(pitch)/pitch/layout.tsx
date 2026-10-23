import type { Metadata } from "next";
import { poppins } from "../_shared/fonts";

export const metadata: Metadata = {
  title: "Lupea — Pitch",
  robots: { index: false, follow: false },
};

export default function PitchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={poppins.className}>{children}</div>;
}
