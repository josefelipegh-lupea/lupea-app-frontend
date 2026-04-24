"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import styles from "./StepLocationProvider.module.css";
import InputField from "@/components/input/InputField";
import { IconsApp } from "@/components/icons/Icons";
import {
  State,
  Municipality,
  LocationValues,
} from "@/app/lib/api/client/location";
import toast from "react-hot-toast";
import {
  getMunicipalitiesProvider,
  getParishesProvider,
  getStatesProvider,
} from "@/app/lib/api/vendor/location";

const VENEZUELA_BOUNDS = { north: 12.5, south: 0.8, west: -71.4, east: -59.7 };
const INITIAL_COORDS = { lat: 10.4806, lng: -66.8983 };

const STOP_WORDS = [
  "municipio",
  "autonomo",
  "parroquia",
  "estado",
  "de",
  "del",
  "la",
  "el",
  "distrito",
  "capital",
  "bolivariano",
  "libertador",
];

const normalizeText = (text: string) =>
  text
    ? text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
    : "";

const cleanAndTokenize = (text: string) => {
  return normalizeText(text)
    .split(/\s+/)
    .filter((word) => !STOP_WORDS.includes(word) && word.length > 2);
};

const isSmartMatch = (googleText: string, dbText: string) => {
  const cleanGoogle = normalizeText(googleText);
  const dbTokens = cleanAndTokenize(dbText);
  if (dbTokens.length === 0) return cleanGoogle.includes(normalizeText(dbText));
  return dbTokens.every((token) => cleanGoogle.includes(token));
};

interface StepLocationProviderProps {
  jwt: string | null;
  locationData: LocationValues | null;
  setLocationData: (data: LocationValues) => void;
  onSuccess: () => void;
}

export default function StepLocationProvider({
  jwt,
  locationData,
  setLocationData,
}: StepLocationProviderProps) {
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<string[]>([]);

  // Fuente de verdad: carga inicial del Padre (LocalStorage)
  const [localFormData, setLocalFormData] = useState<LocationValues>(
    locationData || {
      name: "",
      type: "branch",
      state: "",
      municipality: "",
      parish: "",
      address: "",
      exactAddress: "",
      latitude: INITIAL_COORDS.lat,
      longitude: INITIAL_COORDS.lng,
      placeId: "",
    }
  );

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  const isWithinVenezuela = (lat: number, lng: number) => {
    return (
      lat >= VENEZUELA_BOUNDS.south &&
      lat <= VENEZUELA_BOUNDS.north &&
      lng >= VENEZUELA_BOUNDS.west &&
      lng <= VENEZUELA_BOUNDS.east
    );
  };

  const findMatchInResults = (
    results: google.maps.GeocoderResult[],
    validList: string[]
  ) => {
    const allGoogleTexts = results.flatMap((res) => [
      ...res.address_components.map((c) => c.long_name),
      res.formatted_address,
    ]);

    for (const validName of validList) {
      for (const googleText of allGoogleTexts) {
        if (isSmartMatch(googleText, validName)) return validName;
      }
    }
    return "";
  };

  // 1. Cargar Estados
  useEffect(() => {
    const fetchStates = async () => {
      if (!jwt) return;
      try {
        const res = await getStatesProvider(jwt);
        if (res.ok) setStates(res.data);
      } catch (error) {
        toast.error("Error al cargar estados");
      }
    };
    fetchStates();
  }, [jwt]);

  // 2. Cargar Municipios
  useEffect(() => {
    const fetchMunicipalitiesData = async () => {
      if (!jwt || !localFormData.state) {
        setMunicipalities([]);
        return;
      }
      const stateObj = states.find((s) => s.name === localFormData.state);
      if (!stateObj) return;

      try {
        const response = await getMunicipalitiesProvider(jwt, stateObj.id);
        if (response.ok) {
          setMunicipalities(response.data.municipalities);
        }
      } catch (error) {
        console.error("Error municipios:", error);
      }
    };
    fetchMunicipalitiesData();
  }, [localFormData.state, states, jwt]);

  // 3. Cargar Parroquias
  useEffect(() => {
    const fetchParishesData = async () => {
      if (!jwt || !localFormData.municipality || !localFormData.state) {
        setParishes([]);
        return;
      }
      const stateObj = states.find((s) => s.name === localFormData.state);
      const muniObj = municipalities.find(
        (m) => m.name === localFormData.municipality
      );
      if (!stateObj || !muniObj) return;

      try {
        const response = await getParishesProvider(
          jwt,
          stateObj.id,
          muniObj.name
        );
        if (response.ok) {
          setParishes(response.data.parishes);
        }
      } catch (error) {
        console.error("Error parroquias:", error);
      }
    };
    fetchParishesData();
  }, [localFormData.municipality, municipalities]);

  // 4. EL PIN MANDA: handleLocationUpdate
  // REGLA: el GPS/pin NUNCA sobreescribe lo que el usuario ya tipeo o selecciono.
  // Solo actualiza lat/lng y mueve el mapa. El smart-fill de selects solo ocurre
  // si el campo esta vacio — preservando siempre la seleccion manual del usuario.
  const handleLocationUpdate = (lat: number, lng: number) => {
    if (!isWithinVenezuela(lat, lng)) {
      toast.error("Ubicación fuera de Venezuela");
      return;
    }

    // Mover el mapa inmediatamente al detectar la posicion
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(17);
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setLocalFormData((prev) => {
          // Solo hacer smart-fill si el campo esta vacio — nunca sobreescribir
          let newState = prev.state;
          let newMunicipality = prev.municipality;
          let newParish = prev.parish;

          if (!prev.state) {
            newState = findMatchInResults(results, states.map((s) => s.name));
          }
          if (!prev.municipality) {
            newMunicipality = findMatchInResults(
              results,
              municipalities.map((m) => m.name)
            );
          }
          if (!prev.parish) {
            newParish = findMatchInResults(results, parishes);
          }

          return {
            ...prev,
            latitude: lat,
            longitude: lng,
            placeId: results[0].place_id,
            address: results[0].formatted_address,
            // Los campos de texto/seleccion del usuario se preservan intactos
            state: newState,
            municipality: newMunicipality,
            parish: newParish,
            // exactAddress nunca se toca desde el GPS
          };
        });
      } else {
        // Si geocode falla, igual actualizamos coordenadas
        setLocalFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      }
    });
  };

  // 5. BÚSQUEDA POR TEXTO (Solo ocurre por tecleo)
  // 5. BÚSQUEDA POR TEXTO (Ahora también actualiza los selects)
  const handleDetailedAddressSearch = (specificAddress: string) => {
    const fullQuery = [
      specificAddress,
      localFormData.parish,
      localFormData.municipality,
      localFormData.state,
      "Venezuela",
    ]
      .filter(Boolean)
      .join(", ");

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { address: fullQuery, componentRestrictions: { country: "VE" } },
      (results, status) => {
        if (status === "OK" && results?.[0] && mapRef.current) {
          const res = results[0];
          const { lat, lng } = res.geometry.location;

          // 1. Mover el mapa
          mapRef.current.panTo({ lat: lat(), lng: lng() });
          mapRef.current.setZoom(17);

          // 2. Intentar buscar matches para los selects basados en lo que encontró Google
          const matchedState = findMatchInResults(
            results,
            states.map((s) => s.name)
          );
          const matchedMuni = findMatchInResults(
            results,
            municipalities.map((m) => m.name)
          );
          const matchedParish = findMatchInResults(results, parishes);

          // 3. Actualizar TODO el estado
          setLocalFormData((prev) => ({
            ...prev,
            latitude: lat(),
            longitude: lng(),
            address: res.formatted_address,
            placeId: res.place_id,
            // Aquí la magia: si Google encontró un estado/muni/parroquia diferente, lo ponemos
            state: matchedState || prev.state,
            municipality: matchedMuni || prev.municipality,
            parish: matchedParish || prev.parish,
          }));
        }
      }
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalFormData((prev) => ({ ...prev, exactAddress: value }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 5) {
      searchTimeoutRef.current = setTimeout(() => {
        handleDetailedAddressSearch(value);
      }, 1500);
    }
  };

  // Sincronización con el padre cada vez que cambie algo
  useEffect(() => {
    setLocationData(localFormData);
  }, [localFormData, setLocationData]);

  const updateMapByQuery = (query: string, zoom: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${query}, Venezuela` }, (results, status) => {
      if (status === "OK" && results?.[0] && mapRef.current) {
        const loc = results[0].geometry.location;
        mapRef.current.panTo(loc);
        mapRef.current.setZoom(zoom);
        setLocalFormData((prev) => ({
          ...prev,
          latitude: loc.lat(),
          longitude: loc.lng(),
        }));
      }
    });
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) =>
        handleLocationUpdate(p.coords.latitude, p.coords.longitude)
      );
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.layoutContent}>
        <section className={styles.formSection}>
          <InputField
            label="Nombre de la Sede Principal"
            name="name"
            value={localFormData.name}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, name: e.target.value })
            }
          />

          <div className={styles.chipsContainer}>
            {["Taller", "Tienda", "Oficina"].map((tag) => (
              <button
                key={tag}
                type="button"
                className={`${styles.chip} ${
                  localFormData.name === tag ? styles.chipActive : ""
                }`}
                onClick={() => setLocalFormData((p) => ({ ...p, name: tag }))}
              >
                {tag}
              </button>
            ))}
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Estado</label>
            <div className={styles.selectWrapper}>
              <select
                value={localFormData.state}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalFormData({
                    ...localFormData,
                    state: val,
                    municipality: "",
                    parish: "",
                    exactAddress: "",
                  });
                  if (val) updateMapByQuery(val, 9);
                }}
                className={styles.input}
              >
                <option value="">Seleccione Estado</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
              <div className={styles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Municipio</label>
            <div className={styles.selectWrapper}>
              <select
                value={localFormData.municipality}
                disabled={!localFormData.state}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalFormData({
                    ...localFormData,
                    municipality: val,
                    parish: "",
                    exactAddress: "",
                  });
                  if (val)
                    updateMapByQuery(`${val}, ${localFormData.state}`, 13);
                }}
                className={styles.input}
              >
                <option value="">Seleccione Municipio</option>
                {municipalities.map((m, i) => (
                  <option key={i} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <div className={styles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>
          </div>

          <div className={styles.selectGroup}>
            <label className={styles.label}>Parroquia</label>
            <div className={styles.selectWrapper}>
              <select
                value={localFormData.parish}
                disabled={!localFormData.municipality}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocalFormData({
                    ...localFormData,
                    parish: val,
                    exactAddress: "",
                  });
                  if (val)
                    updateMapByQuery(
                      `${val}, ${localFormData.municipality}`,
                      15
                    );
                }}
                className={styles.input}
              >
                <option value="">Seleccione Parroquia</option>
                {parishes.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <div className={styles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>
          </div>

          <InputField
            label="Dirección Específica"
            name="exactAddress"
            value={localFormData.exactAddress}
            onChange={handleInputChange}
          />
        </section>

        <div className={styles.mapWrapper}>
          {isLoaded && (
            <GoogleMap
              onLoad={(map) => {
                mapRef.current = map;
              }}
              mapContainerStyle={{
                width: "100%",
                height: "400px",
                borderRadius: "12px",
              }}
              center={{
                lat: localFormData.latitude,
                lng: localFormData.longitude,
              }}
              zoom={15}
              options={{
                disableDefaultUI: true,
                restriction: {
                  latLngBounds: VENEZUELA_BOUNDS,
                  strictBounds: false,
                },
              }}
              onClick={(e) =>
                e.latLng && handleLocationUpdate(e.latLng.lat(), e.latLng.lng())
              }
            >
              <Marker
                position={{
                  lat: localFormData.latitude,
                  lng: localFormData.longitude,
                }}
                draggable
                onDragEnd={(e) =>
                  e.latLng &&
                  handleLocationUpdate(e.latLng.lat(), e.latLng.lng())
                }
              />
            </GoogleMap>
          )}
          <button
            className={styles.gpsButton}
            onClick={handleGPS}
            type="button"
          >
            <IconsApp.GPS />
          </button>
        </div>
      </div>
    </div>
  );
}
