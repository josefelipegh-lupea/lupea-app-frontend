"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";

interface FooterVisibilityContextType {
  isFooterVisible: boolean;
}

const FooterVisibilityContext = createContext<FooterVisibilityContextType>({
  isFooterVisible: true,
});

export const useFooterVisibility = () => useContext(FooterVisibilityContext);

export function FooterVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    return () => window.removeEventListener("resize", checkDesktop);
  }, []);

  const value = useMemo(() => {
    const isRequestPage = pathname.includes("/request");
    const isSendQuotePage = pathname.includes("/send-quote");

    if (isDesktop) {
      return { isFooterVisible: true };
    }

    return {
      isFooterVisible: !isRequestPage && !isSendQuotePage,
    };
  }, [pathname, isDesktop]);

  return (
    <FooterVisibilityContext.Provider value={value}>
      {children}
    </FooterVisibilityContext.Provider>
  );
}
