"use client";

import { useEffect, useState } from "react";

/**
 * useKeyboardHeight
 *
 * Detecta la altura del teclado virtual en móvil usando la API visualViewport.
 * - En Android Chrome ≥108 con `interactiveWidget: 'resizes-content'` (definido en layout.tsx),
 *   el viewport ya se encoge automáticamente, por lo que este hook retorna 0.
 * - En iOS Safari (que siempre hace overlay), este hook mide la diferencia entre
 *   `window.innerHeight` y `visualViewport.height` para calcular el espacio ocupado
 *   por el teclado y permitir compensarlo vía inline style.
 *
 * Retorna 0 en SSR, desktop o cuando el teclado está cerrado.
 */
export function useKeyboardHeight(): number {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function handleResize() {
      const height = window.innerHeight - (vv?.height ?? window.innerHeight);
      // Ignorar valores negativos o mínimos (ruido de scroll en iOS)
      setKeyboardHeight(height > 50 ? height : 0);
    }

    vv.addEventListener("resize", handleResize);
    // Llamada inicial por si el componente monta con teclado abierto
    handleResize();

    return () => {
      vv.removeEventListener("resize", handleResize);
    };
  }, []);

  return keyboardHeight;
}
