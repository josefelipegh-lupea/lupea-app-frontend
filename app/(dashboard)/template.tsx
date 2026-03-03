"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
// Importamos el CSS del layout para asegurarnos de que la clase coincida si es necesario
import layoutStyles from "./layout.module.css";

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      const scrollContainer = document.querySelector(
        `.${layoutStyles.mainContent}`
      );

      if (scrollContainer) {
        scrollContainer.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });
      }
    }, 10);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1],
      }}
      style={{
        width: "100%",
        willChange: "transform, opacity",
      }}
    >
      {children}
    </motion.div>
  );
}
