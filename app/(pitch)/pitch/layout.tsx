import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

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
