"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { useSidebar } from "@/context/SidebarContext";
import styles from "./LocationPage.module.css";
import InputField from "@/components/input/InputField";
import Header from "@/components/header/Header";
import { IconsApp } from "@/components/icons/Icons";
import Button from "@/components/button/Button";
import StepTransition from "@/components/provider-onboarding/step-transition/StepTransition";
import { useAuth } from "@/context/AuthContext";
import {
  createLocation,
  getClientLocations,
  Location,
  LocationValues,
  updateLocation,
  deleteLocation,
  getStates,
  Municipality,
  getMunicipalities,
  State,
  getParishes,
} from "@/app/lib/api/client/location";
import toast from "react-hot-toast";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";

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

export default function LocationPage() {
  const { isExpanded } = useSidebar();
  const { jwt } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [formData, setFormData] = useState<LocationValues>({
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

  const lastValidPos = useRef({
    lat: INITIAL_COORDS.lat,
    lng: INITIAL_COORDS.lng,
  });
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

  useEffect(() => {
    const init = async () => {
      if (!jwt) return;
      try {
        const [locs, statesRes] = await Promise.all([
          getClientLocations(jwt),
          getStates(jwt),
        ]);
        setSavedLocations(locs.data);
        if (statesRes.ok) setStates(statesRes.data);
      } catch (error) {
        toast.error("Error al sincronizar datos");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [jwt]);

  useEffect(() => {
    if (!jwt || !formData.state) {
      setMunicipalities([]);
      return;
    }
    const fetchMuni = async () => {
      const stateObj = states.find((s) => s.name === formData.state);
      if (stateObj) {
        const res = await getMunicipalities(jwt, stateObj.id);
        if (res.ok) setMunicipalities(res.data.municipalities);
      }
    };
    fetchMuni();
  }, [formData.state, states, jwt]);

  useEffect(() => {
    if (!jwt || !formData.municipality || !formData.state) {
      setParishes([]);
      return;
    }
    const fetchParish = async () => {
      const stateObj = states.find((s) => s.name === formData.state);
      if (stateObj) {
        const res = await getParishes(jwt, stateObj.id, formData.municipality);
        if (res.ok) setParishes(res.data.parishes);
      }
    };
    fetchParish();
  }, [formData.municipality, formData.state, states, jwt]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    if (!isWithinVenezuela(lat, lng)) {
      toast.error("Ubicación fuera de Venezuela");
      return;
    }
    lastValidPos.current = { lat, lng };

    // Mover el mapa inmediatamente al detectar la posicion
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(17);
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setFormData((prev) => {
          // REGLA: solo hacer smart-fill si el campo esta vacio.
          // Nunca sobreescribir lo que el usuario ya selecciono o tipeo.
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
            address: results[0].formatted_address,
            placeId: results[0].place_id,
            state: newState,
            municipality: newMunicipality,
            parish: newParish,
            // exactAddress nunca se toca desde el GPS
          };
        });
      } else {
        // Si geocode falla, igual actualizamos coordenadas
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
      }
    });
  };

  const handleDetailedAddressSearch = (specificAddress: string) => {
    const fullQuery = [
      specificAddress,
      formData.parish,
      formData.municipality,
      formData.state,
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
          mapRef.current.panTo({ lat: lat(), lng: lng() });
          mapRef.current.setZoom(17);

          const matchedState = findMatchInResults(
            results,
            states.map((s) => s.name)
          );
          const matchedMuni = findMatchInResults(
            results,
            municipalities.map((m) => m.name)
          );
          const matchedParish = findMatchInResults(results, parishes);

          setFormData((prev) => ({
            ...prev,
            latitude: lat(),
            longitude: lng(),
            address: res.formatted_address,
            placeId: res.place_id,
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
    setFormData((prev) => ({ ...prev, exactAddress: value }));
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (value.length >= 5) {
      searchTimeoutRef.current = setTimeout(() => {
        handleDetailedAddressSearch(value);
      }, 1500);
    }
  };

  const updateMapByQuery = (query: string, zoom: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${query}, Venezuela` }, (results, status) => {
      if (status === "OK" && results?.[0] && mapRef.current) {
        const { lat, lng } = results[0].geometry.location.toJSON();
        mapRef.current.panTo({ lat, lng });
        mapRef.current.setZoom(zoom);
        setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
      }
    });
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) => {
        // handleLocationUpdate ya mueve el mapa internamente
        handleLocationUpdate(p.coords.latitude, p.coords.longitude);
      });
    }
  };

  const handleSave = async () => {
    if (!jwt) return;
    setIsSaving(true);
    try {
      if (editingId) {
        await updateLocation(jwt, editingId, formData);
        toast.success("Ubicación actualizada");
      } else {
        await createLocation(jwt, formData);
        toast.success("Ubicación guardada");
      }
      const response = await getClientLocations(jwt);
      setSavedLocations(response.data);
      setDirection(-1);
      setCurrentStep(0);
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (loc: Location) => {
    setEditingId(loc.id);
    setFormData({ ...loc });
    lastValidPos.current = { lat: loc.latitude, lng: loc.longitude };
    setDirection(1);
    setCurrentStep(1);
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
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
    setDirection(1);
    setCurrentStep(1);
  };

  const handleDelete = async () => {
    if (!jwt || !editingId) return;
    try {
      await deleteLocation(jwt, editingId);
      setSavedLocations((prev) => prev.filter((l) => l.id !== editingId));
      setShowDeleteConfirm(false);
      setCurrentStep(0);
      toast.success("Eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer}>
        <Header
          title={
            currentStep === 0
              ? "Mis Ubicaciones"
              : editingId
              ? "Editar Ubicación"
              : "Nueva Ubicación"
          }
          onBack={
            currentStep === 1
              ? () => {
                  setDirection(-1);
                  setCurrentStep(0);
                }
              : undefined
          }
          rightAction={
            currentStep === 1 && editingId ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className={styles.deleteButton}
              >
                <IconsApp.Trash color="#ef4444" />
              </button>
            ) : undefined
          }
        />

        <div className={styles.content}>
          <StepTransition stepKey={currentStep} direction={direction}>
            {currentStep === 0 ? (
              <div className={styles.stepWrapper}>
                {isLoading ? (
                  <div className={styles.loader}>Cargando...</div>
                ) : (
                  <>
                    <div className={styles.listContainer}>
                      {savedLocations.length === 0 ? (
                        <p className={styles.emptyState}>
                          No tienes ubicaciones registradas.
                        </p>
                      ) : (
                        savedLocations.map((loc) => (
                          <div
                            key={loc.id}
                            className={styles.locationCard}
                            onClick={() => handleEdit(loc)}
                          >
                            <div className={styles.iconCircle}>
                              <IconsApp.GPS />
                            </div>
                            <div className={styles.locationText}>
                              <h4>{loc.name || loc.parish}</h4>
                              <p>
                                {loc.municipality}, {loc.state}
                              </p>
                            </div>
                            <IconsApp.RightArrow color="#9ca3af" />
                          </div>
                        ))
                      )}
                    </div>
                    <Button onClick={handleAddNew}>
                      + Agregar nueva ubicación
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.stepWrapper}>
                <div className={styles.layoutContent}>
                  <section className={styles.formSection}>
                    <InputField
                      label={<>Nombre de ubicación <span className={styles.required}>*</span></>}
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Mi Casa"
                    />

                    <div className={styles.chipsContainer}>
                      {["Hogar", "Trabajo", "Taller"].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          className={`${styles.chip} ${
                            formData.name === tag ? styles.chipActive : ""
                          }`}
                          onClick={() =>
                            setFormData((p) => ({ ...p, name: tag }))
                          }
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className={styles.selectGroup}>
                      <label className={styles.label}>Estado <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.input}
                          value={formData.state}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((p) => ({
                              ...p,
                              state: val,
                              municipality: "",
                              parish: "",
                            }));
                            if (val) updateMapByQuery(val, 10);
                          }}
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
                      <label className={styles.label}>Municipio <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.input}
                          value={formData.municipality}
                          disabled={!formData.state}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((p) => ({
                              ...p,
                              municipality: val,
                              parish: "",
                            }));
                            if (val)
                              updateMapByQuery(`${val}, ${formData.state}`, 13);
                          }}
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
                      <label className={styles.label}>Parroquia <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrapper}>
                        <select
                          className={styles.input}
                          value={formData.parish}
                          disabled={!formData.municipality}
                          onChange={(e) => {
                            const val = e.target.value;
                            setFormData((p) => ({ ...p, parish: val }));
                            if (val)
                              updateMapByQuery(
                                `${val}, ${formData.municipality}`,
                                15
                              );
                          }}
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
                      label={<>Dirección <span className={styles.required}>*</span></>}
                      name="address"
                      value={formData.exactAddress}
                      onChange={handleInputChange}
                      placeholder="Ej: Av. Principal, Res. El Parque"
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
                          height: "100%",
                        }}
                        center={{
                          lat: formData.latitude,
                          lng: formData.longitude,
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
                          e.latLng &&
                          handleLocationUpdate(e.latLng.lat(), e.latLng.lng())
                        }
                      >
                        <Marker
                          position={{
                            lat: formData.latitude,
                            lng: formData.longitude,
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
                <div className={styles.buttonGroup}>
                  <Button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !formData.name ||
                      !formData.state ||
                      !formData.municipality ||
                      !formData.parish ||
                      !formData.exactAddress ||
                      !formData.address
                    }
                  >
                    {editingId ? "Actualizar Cambios" : "Guardar Ubicación"}
                  </Button>
                </div>
              </div>
            )}
          </StepTransition>
        </div>
      </div>
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="¿Eliminar ubicación?"
        description="Esta ubicación se borrará permanentemente de tu lista."
      />
    </div>
  );
}
