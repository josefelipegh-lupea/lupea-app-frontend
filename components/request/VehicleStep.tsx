"use client";

import { useEffect, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import {
  Vehicle,
  VehicleItem,
  createVehicle,
  getModelsByBrand,
} from "@/app/lib/api/client/vehicle";
import { FormData } from "@/app/(dashboard)/home/user/request/page";
import StepTransition from "../provider-onboarding/step-transition/StepTransition";
import toast from "react-hot-toast";
import { VERSIONS } from "@/app/(dashboard)/profile/user/vehicle/page";

interface VehicleStepProps {
  jwt: string;
  userVehicles: Vehicle[];
  brands: VehicleItem[];
  engines: VehicleItem[];
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  loadingInitial: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  refreshVehicles: () => Promise<Vehicle[] | undefined>;
}

export default function VehicleStep({
  jwt,
  userVehicles,
  brands,
  engines,
  formData,
  setFormData,
  contentRef,
  refreshVehicles,
}: VehicleStepProps) {
  const years = Array.from({ length: 30 }, (_, i) => (2025 - i).toString());
  const [models, setModels] = useState<VehicleItem[]>([]);

  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);

  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [direction, setDirection] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const goToForm = () => {
    setDirection(1);
    setShowVehicleForm(true);

    setFormData((prev) => ({
      ...prev,
      userVehicle: "",
      brand: "",
      model: "",
      year: 0,
      engine: "",
    }));

    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToList = () => {
    setDirection(-1);
    setShowVehicleForm(false);

    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const selectVehicleFromList = async (vehicle: Vehicle) => {
    const brandObj = brands.find((b) => b.name === vehicle.brand);
    if (brandObj) {
      const res = await getModelsByBrand(jwt, brandObj.name);
      const fetchedModels = res.data || [];
      setModels(fetchedModels);

      const modelObj = fetchedModels.find((m) => m.name === vehicle.model);
      const engineObj = engines.find((e) => e.name === vehicle.engine);

      setFormData({
        ...formData,
        userVehicle: vehicle.id.toString(),
        brand: brandObj.documentId,
        model: modelObj?.documentId || "",
        year: vehicle.year,
        engine: engineObj?.documentId || "",
      });
    }
  };

  const handleBrandChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    setFormData({
      ...formData,
      userVehicle: "",
      brand: brandId,
      model: "",
      year: 0,
      engine: "",
    });
    setModels([]);
    if (!brandId) return;
    const selectedBrand = brands.find((b) => b.documentId === brandId);
    if (selectedBrand) {
      const res = await getModelsByBrand(jwt, selectedBrand.name);
      setModels(res.data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const checkScroll = () => {
    const el = listRef.current;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
      setShowScrollArrow(isScrollable && !isAtBottom);
    }
  };

  const scrollToNextVehicle = () => {
    const el = listRef.current;
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

  const handleAddVehicle = async () => {
    if (
      !formData.brand ||
      !formData.model ||
      !formData.year ||
      !formData.engine
    ) {
      return;
    }
    if (!jwt) return;

    setIsSubmitting(true);
    try {
      const brandObj = brands.find((b) => b.documentId === formData.brand);
      const modelObj = models.find((m) => m.documentId === formData.model);
      const engineObj = engines.find((e) => e.documentId === formData.engine);

      const payload = {
        brand: brandObj?.name || formData.brand,
        model: modelObj?.name || formData.model,
        engine: engineObj?.name || formData.engine,
        version: formData.version || "-",
        year: Number(formData.year),
      };

      const res = await createVehicle(jwt, payload);

      if (res.error) throw new Error("Error al guardar el vehículo");

      const newList = await refreshVehicles();

      if (newList && newList.length > 0) {
        const mostRecentId = newList[0].id.toString();

        setFormData((prev) => ({
          ...prev,
          userVehicle: mostRecentId,
        }));
      }

      // setFormData((prev) => ({
      //   ...prev,
      //   brand: "",
      //   model: "",
      //   year: 0,
      //   engine: "",
      // }));

      goToList();
      toast.success("Vehículo agregado con éxito");
    } catch (error) {
      console.error(error);
      toast.error("No se pudo guardar el vehículo. Inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      checkScroll();
    });

    return () => cancelAnimationFrame(frameId);
  }, [userVehicles, showVehicleForm]);

  return (
    <section className={styles.cardVehicleStep}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Car />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 className={styles.cardTitle}>Datos del Vehículo</h2>
        </div>
        {showVehicleForm && (
          <button type="button" className={styles.backBtn} onClick={goToList}>
            Mis Vehículos
          </button>
        )}
      </div>

      <div className={styles.divider} />

      {/* Importante: El cardBody debe tener display: grid para que StepTransition (motion.div) 
          se posicione correctamente una encima de otra durante la salida/entrada */}
      <div className={styles.cardBody}>
        <StepTransition stepKey={showVehicleForm ? 2 : 1} direction={direction}>
          {!showVehicleForm ? (
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Mis vehículos</label>
                <div className={styles.listWrapper}>
                  <div
                    className={styles.vehicleList}
                    ref={listRef}
                    onScroll={checkScroll}
                  >
                    {userVehicles.length === 0 ? (
                      <div className={styles.noVehicles}>
                        No tiene vehículos registrados
                      </div>
                    ) : (
                      userVehicles.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`${styles.vehicleItem} ${
                            formData.userVehicle === v.id.toString()
                              ? styles.activeVehicle
                              : ""
                          }`}
                          onClick={() => selectVehicleFromList(v)}
                        >
                          <div className={styles.vehicleInfo}>
                            <span className={styles.vName}>
                              {v.brand} {v.model} {v.year}
                            </span>
                            <span className={styles.vDetails}>
                              {v.version} {v.engine}
                            </span>
                          </div>
                          <div className={styles.checkCircle}>
                            {formData.userVehicle === v.id.toString() && (
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
                      onClick={scrollToNextVehicle}
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
                <span>Agregar otro vehículo</span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          ) : (
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Marca</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleBrandChange}
                  >
                    <option value="">Seleccionar Marca</option>
                    {brands.map((b) => (
                      <option key={b.documentId} value={b.documentId}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Modelo</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    disabled={!formData.brand}
                  >
                    <option value="">
                      {formData.brand
                        ? "Seleccionar Modelo"
                        : "Primero elija marca"}
                    </option>
                    {models.map((m) => (
                      <option key={m.documentId} value={m.documentId}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Versión</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="version"
                    value={formData.version}
                    onChange={handleChange}
                    disabled={!formData.model}
                  >
                    <option value="">
                      {formData.brand
                        ? "Seleccionar Versión"
                        : "Primero elija el modelo"}
                    </option>
                    {VERSIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Año</label>
                  <div className={styles.selectWrapper}>
                    <select
                      name="year"
                      value={formData.year}
                      onChange={handleChange}
                      disabled={!formData.model}
                    >
                      <option value="">Año</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                    <div className={styles.iconOverlay}>
                      <IconsApp.DownArrow />
                    </div>
                  </div>
                </div>
                <div className={styles.field}>
                  <label>Motor</label>
                  <div className={styles.selectWrapper}>
                    <select
                      name="engine"
                      value={formData.engine}
                      onChange={handleChange}
                      disabled={!formData.year}
                    >
                      <option value="">Motor</option>
                      {engines.map((e) => (
                        <option key={e.documentId} value={e.documentId}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                    <div className={styles.iconOverlay}>
                      <IconsApp.DownArrow />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.addVehicleBtn}
                onClick={handleAddVehicle}
                disabled={isSubmitting}
              >
                <div className={styles.addIconCircle}>
                  <IconsApp.PlusAddNew />
                </div>
                <span>Guardar Vehículo</span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          )}
        </StepTransition>
      </div>
    </section>
  );
}
