"use client";

import React, { useState, useRef, useEffect } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import styles from "./StepLocationProvider.module.css";
import InputField from "@/components/input/InputField";
import { IconsApp } from "@/components/icons/Icons";
import Button from "@/components/button/Button";
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
  onSuccess,
}: StepLocationProviderProps) {
  const [states, setStates] = useState<State[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [parishes, setParishes] = useState<string[]>([]);

  // Inicializamos el estado interno con lo que haya en locationData (LocalStorage) o valores por defecto
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

  const lastValidPos = useRef({
    lat: localFormData.latitude,
    lng: localFormData.longitude,
  });
  const mapRef = useRef<google.maps.Map | null>(null);

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

  // 2. Cargar Municipios (cuando cambia el estado)
  useEffect(() => {
    const fetchMunicipalitiesData = async () => {
      // Si no hay JWT o no hay estado seleccionado, limpiamos y salimos
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
        toast.error("Error al cargar municipios");
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
      if (!stateObj) return;
      try {
        const response = await getParishesProvider(
          jwt,
          stateObj.id,
          localFormData.municipality
        );
        if (response.ok) setParishes(response.data.parishes);
      } catch (error) {
        toast.error("Error al cargar parroquias");
      }
    };
    fetchParishesData();
  }, [localFormData.municipality, localFormData.state, states, jwt]);

  const handleLocationUpdate = (lat: number, lng: number) => {
    if (!isWithinVenezuela(lat, lng)) {
      toast.error("Ubicación fuera de Venezuela");
      return;
    }

    lastValidPos.current = { lat, lng };

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK && results?.[0]) {
        const addressComponents = results[0].address_components;
        const googleStateName =
          addressComponents.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.long_name || "";

        const foundState = states.find(
          (s) =>
            googleStateName.toLowerCase().includes(s.name.toLowerCase()) ||
            s.name.toLowerCase().includes(googleStateName.toLowerCase())
        );

        setLocalFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          exactAddress: results[0].formatted_address,
          placeId: results[0].place_id,
          state: foundState ? foundState.name : prev.state,
        }));
      }
    });
  };

  const updateMapByQuery = (query: string, zoom: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: `${query}, Venezuela` }, (results, status) => {
      if (status === "OK" && results?.[0] && mapRef.current) {
        const loc = results[0].geometry.location;
        const lat = loc.lat();
        const lng = loc.lng();

        if (isWithinVenezuela(lat, lng)) {
          lastValidPos.current = { lat, lng };
          mapRef.current.panTo(loc);
          mapRef.current.setZoom(zoom);
          setLocalFormData((prev) => ({
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
        (p) => handleLocationUpdate(p.coords.latitude, p.coords.longitude),
        () => toast.error("Habilita el GPS para obtener tu ubicación")
      );
    }
  };

  const handleConfirm = () => {
    // Aquí persistimos en el estado global/LocalStorage del padre
    setLocationData(localFormData);
    toast.success("Ubicación guardada localmente");
    // onSuccess();
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.layoutContent}>
        <section className={styles.formSection}>
          <InputField
            label="Nombre de la Sede"
            name="name"
            value={localFormData.name}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, name: e.target.value })
            }
            placeholder="Ej: Sede Principal"
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
                  setLocalFormData({ ...localFormData, parish: val });
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
            name="address"
            placeholder="Urb, calle, local..."
            value={localFormData.address}
            onChange={(e) =>
              setLocalFormData({ ...localFormData, address: e.target.value })
            }
          />

          <Button
            onClick={handleConfirm}
            disabled={
              !localFormData.name ||
              !localFormData.state ||
              !localFormData.parish ||
              !localFormData.address
            }
          >
            Confirmar Ubicación de Sede
          </Button>
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
