"use client";

import React, { createContext, useContext, useMemo } from "react";
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

  const value = useMemo(() => {
    const isRequestPage = pathname.includes("/home/user/request");
    return {
      isFooterVisible: !isRequestPage,
    };
  }, [pathname]);

  return (
    <FooterVisibilityContext.Provider value={value}>
      {children}
    </FooterVisibilityContext.Provider>
  );
}
