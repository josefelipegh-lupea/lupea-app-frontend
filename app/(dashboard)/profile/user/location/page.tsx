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
import { createPortal } from "react-dom";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";

const VENEZUELA_BOUNDS = { north: 12.5, south: 0.8, west: -71.4, east: -59.7 };
const INITIAL_COORDS = { lat: 10.4806, lng: -66.8983 };

const ModalPortal = ({ children }: { children: React.ReactNode }) => {
  if (typeof window === "undefined" || !document.body) return null;

  return createPortal(children, document.body);
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

  // REF para el rebote del pin
  const lastValidPos = useRef({
    lat: INITIAL_COORDS.lat,
    lng: INITIAL_COORDS.lng,
  });
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  // Función de validación corregida
  const isWithinVenezuela = (lat: number, lng: number) => {
    return (
      lat >= VENEZUELA_BOUNDS.south &&
      lat <= VENEZUELA_BOUNDS.north &&
      lng >= VENEZUELA_BOUNDS.west &&
      lng <= VENEZUELA_BOUNDS.east
    );
  };

  useEffect(() => {
    const init = async () => {
      if (!jwt) return;
      try {
        const [locs] = await Promise.all([getClientLocations(jwt)]);
        setSavedLocations(locs.data);
      } catch (error) {
        toast.error("Error al cargar datos");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [jwt]);

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt) return;
      try {
        const res = await getStates(jwt);
        if (res.ok) setStates(res.data);
      } catch (error) {
        toast.error("Error al cargar estados");
      }
    };
    fetchData();
  }, [jwt]);

  useEffect(() => {
    if (!jwt) return;
    const fetchMunicipalitiesData = async () => {
      const stateObj = states.find((s) => s.name === formData.state);
      if (!stateObj) {
        setMunicipalities([]);
        return;
      }
      try {
        const response = await getMunicipalities(jwt, stateObj.id);
        if (response.ok) setMunicipalities(response.data.municipalities);
      } catch (error) {
        toast.error("Error al cargar municipios");
      }
    };
    fetchMunicipalitiesData();
  }, [formData.state, states, jwt]);

  useEffect(() => {
    if (!jwt) return;
    const fetchParishesData = async () => {
      const stateObj = states.find((s) => s.name === formData.state);
      if (!stateObj || !formData.municipality) {
        setParishes([]);
        return;
      }
      try {
        const response = await getParishes(
          jwt,
          stateObj.id,
          formData.municipality
        );
        if (response.ok) setParishes(response.data.parishes);
      } catch (error) {
        toast.error("Error al cargar parroquias");
      }
    };
    fetchParishesData();
  }, [formData.municipality, formData.state, states, jwt]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    // RESTRICCIÓN Y REBOTE
    if (!isWithinVenezuela(lat, lng)) {
      toast.error("Ubicación fuera de Venezuela");
      // Forzamos al estado a volver a la última posición válida para que el pin "rebote"
      setFormData((prev) => ({
        ...prev,
        latitude: lastValidPos.current.lat,
        longitude: lastValidPos.current.lng,
      }));
      return;
    }

    // Si es válida, la guardamos como última posición buena
    lastValidPos.current = { lat, lng };

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, async (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const addressComponents = results[0].address_components;
        const googleFormatted = results[0].formatted_address;
        const googleStateName =
          addressComponents.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "";

        const foundState = states.find(
          (s) =>
            googleStateName.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(googleStateName.toLowerCase())
        );

        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          exactAddress: googleFormatted,
          placeId: results[0].place_id,
          state: foundState ? foundState.name : prev.state,
          municipality:
            foundState && foundState.name !== prev.state
              ? ""
              : prev.municipality,
          parish:
            foundState && foundState.name !== prev.state ? "" : prev.parish,
        }));
      }
    });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = e.target.value;
    setFormData((prev) => ({
      ...prev,
      state: stateName,
      municipality: "",
      parish: "",
    }));
    if (stateName) updateMapByQuery(stateName, 9);
  };

  const handleMunicipalityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const muniName = e.target.value;
    setFormData((prev) => ({ ...prev, municipality: muniName, parish: "" }));
    if (muniName) updateMapByQuery(`${muniName}, ${formData.state}`, 13);
  };

  const updateMapByQuery = (query: string, zoom: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${query}, Venezuela` }, (results, status) => {
      if (status === "OK" && results?.[0] && mapRef.current) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        // Validamos también lo que viene de la búsqueda por texto
        if (isWithinVenezuela(lat, lng)) {
          lastValidPos.current = { lat, lng };
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(zoom);
          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            exactAddress: results[0].formatted_address,
          }));
        }
      }
    });
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) => {
          handleLocationUpdate(p.coords.latitude, p.coords.longitude);
        }
        // { enableHighAccuracy: true }
      );
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
      setCurrentStep(0);
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = async (loc: Location) => {
    if (!jwt) return;
    setEditingId(loc.id);
    setFormData({ ...loc });
    lastValidPos.current = { lat: loc.latitude, lng: loc.longitude };
    setDirection(1);
    setCurrentStep(1);

    const stateObj = states.find((s) => s.name === loc.state);
    if (stateObj) {
      try {
        const muniRes = await getMunicipalities(jwt, stateObj.id);
        if (muniRes.ok) {
          setMunicipalities(muniRes.data.municipalities);
          if (loc.municipality) {
            const parishRes = await getParishes(
              jwt,
              stateObj.id,
              loc.municipality
            );
            if (parishRes.ok) setParishes(parishRes.data.parishes);
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    const initial = {
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
    };
    setFormData(initial);
    lastValidPos.current = { lat: INITIAL_COORDS.lat, lng: INITIAL_COORDS.lng };
    setMunicipalities([]);
    setParishes([]);
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
      toast.success("Ubicación eliminada");
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
          onBack={currentStep === 1 ? () => setCurrentStep(0) : undefined}
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
                      label="Nombre"
                      name="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Ej: Hogar"
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
                      <label className={styles.label}>Estado</label>
                      <div className={styles.selectWrapper}>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleStateChange}
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
                          name="municipality"
                          value={formData.municipality}
                          onChange={handleMunicipalityChange}
                          disabled={!formData.state}
                          className={styles.input}
                        >
                          <option value="">Seleccione Municipio</option>
                          {municipalities.map((m, index) => (
                            <option key={index} value={m.name}>
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
                          name="parish"
                          value={formData.parish}
                          disabled={!formData.municipality}
                          className={styles.input}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              parish: e.target.value,
                            });
                            updateMapByQuery(
                              `${e.target.value}, ${formData.municipality}`,
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
                      label="Dirección"
                      name="address"
                      placeholder="Urb, calle, casa..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    />
                  </section>

                  <div className={styles.mapWrapper}>
                    {isLoaded && (
                      <GoogleMap
                        onLoad={(map) => {
                          mapRef.current = map;
                        }}
                        mapContainerStyle={{ width: "100%", height: "100%" }}
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
