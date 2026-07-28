"use client";

import { useEffect, useState } from "react";

interface VisualViewportRect {
  top: number;
  height: number;
}

/**
 * useVisualViewportRect
 *
 * Rectángulo visible real del visualViewport (offsetTop + height), recalculado
 * en cada resize/scroll. Pensado para UI `position: fixed` (a diferencia de
 * useKeyboardHeight, que sirve para contenido en flujo normal de página).
 *
 * A diferencia de inferir una sola "altura de teclado" y aplicarla como
 * padding, esto contrarresta directamente el scroll que Safari le aplica a
 * elementos `position:fixed` al enfocar un input dentro de ellos (bug
 * documentado de WebKit: Safari intenta "llevar a la vista" el input
 * enfocado desplazando el propio elemento fixed, aunque debería ignorar el
 * scroll). El listener de `scroll` es la pieza clave — sin él no se detecta
 * ese desplazamiento nativo, solo el resize por apertura/cierre de teclado.
 *
 * Retorna null en SSR o sin soporte de visualViewport — usar como fallback
 * al CSS estático (100dvh) en ese caso.
 */
export function useVisualViewportRect(): VisualViewportRect | null {
  const [rect, setRect] = useState<VisualViewportRect | null>(null);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;

    function update() {
      setRect({ top: vv!.offsetTop, height: vv!.height });
    }

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    // Llamada inicial por si el componente monta con teclado ya abierto.
    update();

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, []);

  return rect;
}
