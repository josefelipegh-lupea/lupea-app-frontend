"use client";

import { useEffect, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import StepTransition from "../provider-onboarding/step-transition/StepTransition";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import toast from "react-hot-toast";
import {
  createLocation,
  getClientLocations,
  getStates,
  getMunicipalities,
  getParishes,
  Location,
  LocationValues,
  State,
  Municipality,
} from "@/app/lib/api/client/location";
import { QuoteRequestFormData } from "@/hooks/useRequesFormAutoSave";

interface DeliveryLocationStepProps {
  jwt: string;
  locations: Location[];
  states: State[];
  formData: QuoteRequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteRequestFormData>>;
  saveDraft: (data: QuoteRequestFormData) => void;
  isCompleted: boolean;
  showError?: boolean;
  onLocationAdded?: () => void;
  sectionRef?: React.RefObject<HTMLElement | null>;
}

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

const isWithinVenezuela = (lat: number, lng: number) => {
  return (
    lat >= VENEZUELA_BOUNDS.south &&
    lat <= VENEZUELA_BOUNDS.north &&
    lng >= VENEZUELA_BOUNDS.west &&
    lng <= VENEZUELA_BOUNDS.east
  );
};

export default function DeliveryLocationStep({
  jwt,
  locations,
  states,
  formData,
  setFormData,
  saveDraft,
  isCompleted,
  showError,
  onLocationAdded,
  sectionRef,
}: DeliveryLocationStepProps) {
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<string[]>([]);
  const [listRef, setListRef] = useState<HTMLDivElement | null>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastValidPos = useRef({
    lat: INITIAL_COORDS.lat,
    lng: INITIAL_COORDS.lng,
  });

  const [localLocation, setLocalLocation] = useState<LocationValues>({
    name: "",
    type: "home",
    state: "",
    municipality: "",
    parish: "",
    address: "",
    exactAddress: "",
    latitude: INITIAL_COORDS.lat,
    longitude: INITIAL_COORDS.lng,
    placeId: "",
  });

  // Chip options for quick selection
  const locationTypeChips = [
    { id: "home", label: "Hogar" },
    { id: "work", label: "Trabajo" },
    { id: "workshop", label: "Taller" },
  ];

  const goToForm = () => {
    setDirection(1);
    setShowLocationForm(true);
    // Reset form
    setLocalLocation({
      name: "",
      type: "home",
      state: "",
      municipality: "",
      parish: "",
      address: "",
      exactAddress: "",
      latitude: INITIAL_COORDS.lat,
      longitude: INITIAL_COORDS.lng,
      placeId: "",
    });
    setMunicipalities([]);
    setParishes([]);
  };

  const goToList = () => {
    setDirection(-1);
    setShowLocationForm(false);
  };

  // Fetch municipalities when state changes
  useEffect(() => {
    if (!jwt || !localLocation.state) {
      setMunicipalities([]);
      return;
    }
    const fetchMuni = async () => {
      try {
        const stateObj = states.find((s) => s.name === localLocation.state);
        if (stateObj) {
          const res = await getMunicipalities(jwt, stateObj.id);
          if (res.ok) setMunicipalities(res.data.municipalities);
        }
      } catch (error) {
        console.error("Error loading municipalities:", error);
      }
    };
    fetchMuni();
  }, [localLocation.state, states, jwt]);

  // Fetch parishes when municipality changes
  useEffect(() => {
    if (!jwt || !localLocation.municipality || !localLocation.state) {
      setParishes([]);
      return;
    }
    const fetchParish = async () => {
      try {
        const stateObj = states.find((s) => s.name === localLocation.state);
        if (stateObj) {
          const res = await getParishes(jwt, stateObj.id, localLocation.municipality);
          if (res.ok) setParishes(res.data.parishes);
        }
      } catch (error) {
        console.error("Error loading parishes:", error);
      }
    };
    fetchParish();
  }, [localLocation.municipality, localLocation.state, states, jwt]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    if (!isWithinVenezuela(lat, lng)) {
      toast.error("Ubicación fuera de Venezuela");
      return;
    }
    lastValidPos.current = { lat, lng };

    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(17);
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const formatted = results[0].formatted_address || "";
        setLocalLocation((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: formatted,
          placeId: results[0].place_id || "",
        }));

        // Smart match municipalities and parishes
        if (!localLocation.state && municipalities.length === 0) {
          const stateMatch = findMatchInResults(results, states.map((s) => s.name));
          if (stateMatch) {
            setLocalLocation((prev) => ({ ...prev, state: stateMatch }));
          }
        }

        if (localLocation.state && municipalities.length > 0 && !localLocation.municipality) {
          const muniMatch = findMatchInResults(
            results,
            municipalities.map((m) => m.name)
          );
          if (muniMatch) {
            setLocalLocation((prev) => ({ ...prev, municipality: muniMatch }));
          }
        }

        if (
          localLocation.state &&
          localLocation.municipality &&
          parishes.length > 0 &&
          !localLocation.parish
        ) {
          const parishMatch = findMatchInResults(results, parishes);
          if (parishMatch) {
            setLocalLocation((prev) => ({ ...prev, parish: parishMatch }));
          }
        }
      }
    });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleLocationUpdate(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleGPS = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocalización no disponible");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleLocationUpdate(latitude, longitude);
      },
      () => {
        toast.error("No se pudo obtener tu ubicación");
      }
    );
  };

  const handleExactAddressChange = (value: string) => {
    setLocalLocation((prev) => ({ ...prev, exactAddress: value }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length >= 5) {
      searchTimeoutRef.current = setTimeout(() => {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ address: `${value}, Venezuela` }, (results, status) => {
          if (status === "OK" && results?.[0]) {
            const { lat, lng } = results[0].geometry.location;
            handleLocationUpdate(lat(), lng());
          }
        });
      }, 800);
    }
  };

  const handleAddLocation = async () => {
    if (
      !localLocation.name ||
      !localLocation.state ||
      !localLocation.municipality ||
      !localLocation.parish ||
      !localLocation.address
    ) {
      toast.error("Por favor completa todos los campos");
      return;
    }

    if (!jwt) return;

    setIsSubmitting(true);
    try {
      const res = await createLocation(jwt, localLocation);
      if (res.data) {
        const newLocation = res.data;
        toast.success("Ubicación agregada con éxito");

        // Auto-select the new location
        setFormData((prev) => ({
          ...prev,
          deliveryCity: newLocation.id.toString(),
        }));

        // Call parent callback to refresh locations
        onLocationAdded?.();

        goToList();
      }
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar la ubicación");
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkScroll = () => {
    const el = listRef;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
      setShowScrollArrow(isScrollable && !isAtBottom);
    }
  };

  const scrollToNextLocation = () => {
    const el = listRef;
    if (!el) return;

    const items = el.querySelectorAll(`.${styles.vehicleItem}`);
    if (!items.length) return;

    const itemHeight = (items[0] as HTMLElement).offsetHeight;
    const currentIndex = Math.round(el.scrollTop / itemHeight);
    const nextIndex = Math.min(currentIndex + 1, items.length - 1);

    el.scrollTo({
      top: nextIndex * itemHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      checkScroll();
    });

    return () => cancelAnimationFrame(frameId);
  }, [locations, showLocationForm]);

  return (
    <section className={styles.card} ref={sectionRef}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Pin color="#f58220" />
          </div>
        </div>
        <h2 className={styles.cardTitle}>Ubicación</h2>
        {isCompleted && (
          <div className={styles.stepCompletedBadge}>
            <IconsApp.Check />
          </div>
        )}
        {showLocationForm && (
          <button type="button" className={styles.backBtn} onClick={goToList}>
            Mis Ubicaciones
          </button>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.cardBody}>
        <StepTransition stepKey={showLocationForm ? 2 : 1} direction={direction}>
          {!showLocationForm ? (
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Ubicación <span className={styles.required}>*</span></label>
                <div className={styles.listWrapper}>
                  <div
                    className={styles.vehicleList}
                    ref={setListRef}
                    onScroll={checkScroll}
                  >
                    {locations.length === 0 ? (
                      <div className={styles.noVehicles}>
                        No tienes ubicaciones registradas
                      </div>
                    ) : (
                      locations.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          className={`${styles.vehicleItem} ${
                            formData.deliveryCity === loc.id.toString()
                              ? styles.activeVehicle
                              : ""
                          }`}
                          onClick={() => {
                            const updatedData = {
                              ...formData,
                              deliveryCity: loc.id.toString(),
                            };
                            setFormData(updatedData);
                            saveDraft(updatedData);
                          }}
                        >
                          <div className={styles.vehicleInfo}>
                            <span className={styles.vName}>{loc.name}</span>
                            <span className={styles.vDetails}>
                              {loc.state} - {loc.municipality}
                            </span>
                          </div>
                          <div className={styles.checkCircle}>
                            {formData.deliveryCity === loc.id.toString() && (
                              <div className={styles.checkInner} />
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  {showScrollArrow && (
                    <button
                      type="button"
                      className={styles.scrollIndicator}
                      onClick={scrollToNextLocation}
                    >
                      <IconsApp.DownArrow />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={styles.addVehicleBtn}
                onClick={goToForm}
              >
                <div className={styles.addIconCircle}>
                  <IconsApp.PlusAddNew />
                </div>
                <span>Agregar ubicación</span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          ) : (
            <div className={styles.subStepContainer}>
              {/* NAME FIELD */}
              <div className={styles.field}>
                <label>Nombre de la ubicación <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="Ej: Mi casa, Mi oficina"
                  value={localLocation.name}
                  onChange={(e) =>
                    setLocalLocation((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={styles.input}
                />
              </div>

              {/* QUICK TYPE SELECTION */}
              <div className={styles.field}>
                <label>Tipo de ubicación</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                  {locationTypeChips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() =>
                        setLocalLocation((prev) => ({ ...prev, type: chip.id as any }))
                      }
                      style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        border:
                          localLocation.type === chip.id
                            ? "2px solid #f58220"
                            : "1px solid #e5e7eb",
                        backgroundColor:
                          localLocation.type === chip.id ? "#fff7ed" : "#f9fafb",
                        color: localLocation.type === chip.id ? "#f58220" : "#6b7280",
                        fontWeight: localLocation.type === chip.id ? "600" : "400",
                        cursor: "pointer",
                        fontSize: "13px",
                        transition: "all 0.2s",
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* CASCADING SELECTS */}
              <div className={styles.field}>
                <label>Estado <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    value={localLocation.state}
                    onChange={(e) =>
                      setLocalLocation((prev) => ({
                        ...prev,
                        state: e.target.value,
                        municipality: "",
                        parish: "",
                      }))
                    }
                    className={styles.selectInput}
                  >
                    <option value="">Seleccionar Estado</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Municipio <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    value={localLocation.municipality}
                    onChange={(e) =>
                      setLocalLocation((prev) => ({
                        ...prev,
                        municipality: e.target.value,
                        parish: "",
                      }))
                    }
                    disabled={!localLocation.state}
                    className={styles.selectInput}
                  >
                    <option value="">
                      {localLocation.state ? "Seleccionar Municipio" : "Primero selecciona estado"}
                    </option>
                    {municipalities.map((muni, idx) => (
                      <option key={idx} value={muni.name}>
                        {muni.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Parroquia <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    value={localLocation.parish}
                    onChange={(e) =>
                      setLocalLocation((prev) => ({ ...prev, parish: e.target.value }))
                    }
                    disabled={!localLocation.municipality}
                    className={styles.selectInput}
                  >
                    <option value="">
                      {localLocation.municipality
                        ? "Seleccionar Parroquia"
                        : "Primero selecciona municipio"}
                    </option>
                    {parishes.map((parish, idx) => (
                      <option key={idx} value={parish}>
                        {parish}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              {/* EXACT ADDRESS */}
              <div className={styles.field}>
                <label>Dirección exacta <span className={styles.required}>*</span></label>
                <input
                  type="text"
                  placeholder="Calle, número, apartamento..."
                  value={localLocation.exactAddress}
                  onChange={(e) => handleExactAddressChange(e.target.value)}
                  className={styles.input}
                />
              </div>

              {/* GOOGLE MAP */}
              {isLoaded && (
                <div className={styles.field}>
                  <label>Ubicación en mapa</label>
                  <div style={{ position: "relative", height: "300px", borderRadius: "8px", overflow: "hidden", marginTop: "8px" }}>
                    <GoogleMap
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                      center={{ lat: localLocation.latitude, lng: localLocation.longitude }}
                      zoom={17}
                      onLoad={(map) => {
                        mapRef.current = map;
                      }}
                      onClick={handleMapClick}
                    >
                      <Marker
                        position={{ lat: localLocation.latitude, lng: localLocation.longitude }}
                        draggable
                        onDragEnd={handleMarkerDragEnd}
                      />
                    </GoogleMap>
                    <button
                      type="button"
                      onClick={handleGPS}
                      style={{
                        position: "absolute",
                        bottom: "12px",
                        right: "12px",
                        padding: "8px 12px",
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px",
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        zIndex: 10,
                      }}
                    >
                      📍 Mi ubicación
                    </button>
                  </div>
                </div>
              )}

              {/* SAVE BUTTON */}
              <button
                type="button"
                className={styles.addVehicleBtn}
                onClick={handleAddLocation}
                disabled={isSubmitting}
              >
                <div className={styles.addIconCircle}>
                  <IconsApp.PlusAddNew />
                </div>
                <span>Guardar Ubicación</span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          )}
        </StepTransition>
      </div>

      {showError && (
        <p className={styles.submitError}>
          Selecciona una ubicación para continuar.
        </p>
      )}
    </section>
  );
}
