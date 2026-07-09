"use client";

// Placeholder temporal del avatar de Lupita hasta tener el arte oficial.
// Cambiar aquí (un solo lugar) cuando exista la imagen definitiva.

interface LupitaAvatarProps {
  size?: number;
}

const NAVY = "#1a1a3d"; // mismo navy de la tarjeta de lupas

export default function LupitaAvatar({ size = 44 }: LupitaAvatarProps) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: NAVY,
        color: "#ffffff",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        fontSize: size * 0.45,
        lineHeight: 1,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      L
    </span>
  );
}
