"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isExpanded: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Inicializamos en true (asumiendo desktop primero para evitar saltos visuales)
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Solo se ejecuta en el cliente
    const handleResize = () => {
      if (window.innerWidth < 1200) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };

    // Ejecutamos una vez al montar
    handleResize();

    // Opcional: Escuchar cambios de tamaño de ventana
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsExpanded((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isExpanded, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context)
    throw new Error("useSidebar debe usarse dentro de SidebarProvider");
  return context;
};
