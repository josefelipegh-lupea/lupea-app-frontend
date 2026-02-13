import { useState, useEffect } from "react";

interface LocationData {
  lat: number | null;
  lng: number | null;
  city: string;
  state: string;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData>({
    lat: null,
    lng: null,
    city: "",
    state: "",
    error: null,
    loading: false,
  });

  const getPosition = () => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        error: "Geolocalización no soportada",
      }));
      return;
    }

    setLocation((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Geocodificación inversa con Nominatim (Gratis)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`
          );
          const data = await response.json();

          const detectedState =
            data.address?.state || data.address?.province || "";
          const detectedCity =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            "";

          setLocation({
            lat: latitude,
            lng: longitude,
            state: detectedState.replace(/Estado\s+/i, "").trim(),
            city: detectedCity.trim(),
            error: null,
            loading: false,
          });
        } catch (err) {
          setLocation((prev) => ({
            ...prev,
            lat: latitude,
            lng: longitude,
            loading: false,
            error: "Error al obtener nombres de ubicación",
          }));
        }
      },
      (error) => {
        setLocation((prev) => ({
          ...prev,
          loading: false,
          error: "Permiso de ubicación denegado",
        }));
      },
      { enableHighAccuracy: true }
    );
  };

  // Se ejecuta automáticamente al cargar, pero también puedes llamar a getPosition manualmente
  useEffect(() => {
    setTimeout(() => {
      getPosition();
    }, 0);
  }, []);

  return { ...location, refresh: getPosition };
};
