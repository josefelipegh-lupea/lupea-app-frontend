"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface PageAnimationProps {
  children: React.ReactNode;
}

export function PageAnimation({ children }: PageAnimationProps) {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => {
    setKey(pathname);
  }, [pathname]);

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        ease: [0.32, 0.72, 0, 1],
      }}
      style={{ width: "100%", height: "100%" }}
    >
      {children}
    </motion.div>
  );
}
