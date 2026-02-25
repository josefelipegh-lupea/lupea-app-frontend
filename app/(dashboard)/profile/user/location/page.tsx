"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
} from "@react-google-maps/api";
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
  deleteLocation,
  getClientLocations,
  Location,
  LocationValues,
  updateLocation,
} from "@/app/lib/api/client/location";
import toast from "react-hot-toast";

const VENEZUELA_BOUNDS = { north: 12.2, south: 0.6, west: -73.4, east: -59.8 };
const INITIAL_COORDS = { lat: 10.4806, lng: -66.8983 };

export default function LocationPage() {
  const { isExpanded } = useSidebar();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { jwt } = useAuth();

  const [savedLocations, setSavedLocations] = useState<Location[]>([]);

  const [formData, setFormData] = useState<LocationValues>({
    name: "",
    type: "home",
    state: "",
    city: "",
    searchText: "",
    zone: "",
    exactAddress: "",
    latitude: INITIAL_COORDS.lat,
    longitude: INITIAL_COORDS.lng,
    placeId: "",
  });

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries: ["places"],
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const handleAddNew = () => {
    setDirection(1);
    setEditingId(null);
    setFormData({
      name: "",
      type: "home",
      state: "",
      city: "",
      searchText: "",
      zone: "",
      exactAddress: "",
      latitude: INITIAL_COORDS.lat,
      longitude: INITIAL_COORDS.lng,
      placeId: "",
    });
    setCurrentStep(1);
  };

  const handleEdit = (loc: Location) => {
    setDirection(1);
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      type: loc.type,
      state: loc.state,
      city: loc.city,
      searchText: loc.searchText,
      zone: loc.zone,
      exactAddress: loc.exactAddress,
      latitude: loc.latitude,
      longitude: loc.longitude,
      placeId: loc.placeId,
    });
    setCurrentStep(1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLocationUpdate = (lat: number, lng: number) => {
    if (
      lat <= VENEZUELA_BOUNDS.north &&
      lat >= VENEZUELA_BOUNDS.south &&
      lng <= VENEZUELA_BOUNDS.east &&
      lng >= VENEZUELA_BOUNDS.west
    ) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const place = results[0];
          let city = "",
            state = "",
            zone = "";

          place.address_components.forEach((comp) => {
            if (comp.types.includes("administrative_area_level_1"))
              state = comp.long_name;
            if (comp.types.includes("locality")) city = comp.long_name;
            if (
              comp.types.includes("sublocality") ||
              comp.types.includes("neighborhood")
            )
              zone = comp.long_name;
          });

          setFormData((prev) => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            state,
            city,
            zone,
            exactAddress: place.formatted_address,
            searchText: place.formatted_address,
            placeId: place.place_id,
          }));
        }
      });
    } else {
      toast.error("Ubicación fuera de los límites de Venezuela");
    }
  };

  const handleGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((p) =>
        handleLocationUpdate(p.coords.latitude, p.coords.longitude)
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

      // Recargar lista
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

  useEffect(() => {
    const loadLocations = async () => {
      if (!jwt) return;
      try {
        const response = await getClientLocations(jwt);
        setSavedLocations(response.data);
      } catch (error) {
        toast.error("Error al cargar ubicaciones");
      } finally {
        setIsLoading(false);
      }
    };
    loadLocations();
  }, [jwt]);

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
                  <div className={styles.loader}>Cargando ubicaciones...</div>
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
                              <h4>{loc.name || loc.zone || "Ubicación"}</h4>
                              <p>
                                {loc.city}, {loc.state}
                              </p>
                            </div>
                            <IconsApp.RightArrow color="#9ca3af" />
                          </div>
                        ))
                      )}
                    </div>
                    <div className={styles.buttonGroup}>
                      <Button onClick={handleAddNew}>
                        + Agregar nueva ubicación
                      </Button>
                    </div>
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
                      onChange={handleChange}
                      placeholder="Ej: Hogar"
                    />
                    <div className={styles.chipsContainer}>
                      {["Hogar", "Trabajo", "Taller", "Casa"].map((tag) => (
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
                    {isLoaded && (
                      <Autocomplete
                        onLoad={(r) => (autocompleteRef.current = r)}
                        onPlaceChanged={() => {
                          const p = autocompleteRef.current?.getPlace();
                          if (p?.geometry?.location)
                            handleLocationUpdate(
                              p.geometry.location.lat(),
                              p.geometry.location.lng()
                            );
                        }}
                      >
                        <InputField
                          label="Buscar ubicación"
                          name="state"
                          placeholder="Ej: Barquisimeto"
                          value={formData.state}
                          onChange={handleChange}
                        />
                      </Autocomplete>
                    )}
                    <InputField
                      label="Parroquia / Zona"
                      name="zone"
                      placeholder="Ej: Irribarren"
                      value={formData.zone}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Dirección exacta"
                      name="address"
                      placeholder="Urb, calle, avenida..."
                      value={formData.exactAddress}
                      onChange={handleChange}
                    />
                  </section>

                  <div className={styles.mapWrapper}>
                    {isLoaded && (
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={{
                          lat: formData.latitude,
                          lng: formData.longitude,
                        }}
                        zoom={15}
                        options={{ disableDefaultUI: true }}
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
                  <Button onClick={handleSave}>
                    {editingId ? "Actualizar Cambios" : "Guardar Ubicación"}
                  </Button>
                  <button
                    className={styles.btnCancel}
                    onClick={() => {
                      setDirection(-1);
                      setCurrentStep(0);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </StepTransition>
        </div>
      </div>

      {showDeleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={styles.floatingCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>¿Eliminar ubicación?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <button className={styles.confirmDeleteBtn} onClick={handleDelete}>
              Sí, eliminar
            </button>
            <button
              className={styles.btnCancel}
              onClick={() => setShowDeleteConfirm(false)}
            >
              No, mantener
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
