"use client";

import { useEffect, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import {
  Vehicle,
  VehicleItem,
  createVehicle,
  findVehicleItemByName,
  getEngineTypes,
  getModelEnginesByModel,
  getModelsByBrand,
} from "@/app/lib/api/client/vehicle";
import StepTransition from "../provider-onboarding/step-transition/StepTransition";
import toast from "react-hot-toast";
import { QuoteRequestFormData } from "@/hooks/useRequesFormAutoSave";
import SearchableSelect from "@/components/searchable-select/SearchableSelect";

interface VehicleStepProps {
  jwt: string;
  userVehicles: Vehicle[];
  brands: VehicleItem[];
  formData: QuoteRequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteRequestFormData>>;
  loadingInitial: boolean;
  contentRef: React.RefObject<HTMLDivElement | null>;
  refreshVehicles: () => Promise<Vehicle[] | undefined>;
  isCompleted: boolean;
  saveDraft: (data: QuoteRequestFormData) => void;
  showError?: boolean;
  sectionRef?: React.RefObject<HTMLElement | null>;
}

export default function VehicleStep({
  jwt,
  userVehicles,
  brands,
  formData,
  setFormData,
  loadingInitial,
  contentRef,
  refreshVehicles,
  isCompleted,
  saveDraft,
  showError,
  sectionRef,
}: VehicleStepProps) {
  const years = Array.from({ length: 30 }, (_, i) => (2025 - i).toString());
  const [models, setModels] = useState<VehicleItem[]>([]);
  const [engineOptions, setEngineOptions] = useState<VehicleItem[]>([]);
  const [usingEngineTypeFallback, setUsingEngineTypeFallback] = useState(false);

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
      version: "",
    }));
    setEngineOptions([]);
    setUsingEngineTypeFallback(false);

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
    const brandObj = vehicle.brandMaster
      ? brands.find((b) => b.documentId === vehicle.brandMaster?.documentId)
      : findVehicleItemByName(brands, vehicle.brand);
    if (brandObj) {
      const res = await getModelsByBrand(jwt, brandObj.documentId);
      const fetchedModels = res.data || [];
      setModels(fetchedModels);

      const modelObj = vehicle.modelMaster
        ? fetchedModels.find((m) => m.documentId === vehicle.modelMaster?.documentId)
        : findVehicleItemByName(fetchedModels, vehicle.model);

      let engineObj: VehicleItem | undefined;
      if (modelObj) {
        const engineRes = await getModelEnginesByModel(jwt, modelObj.documentId);
        const fetchedEngines = engineRes.data || [];

        if (fetchedEngines.length > 0) {
          setEngineOptions(fetchedEngines);
          setUsingEngineTypeFallback(false);
          engineObj = vehicle.modelEngineMaster
            ? fetchedEngines.find(
                (engineItem) =>
                  engineItem.documentId === vehicle.modelEngineMaster?.documentId
              )
            : findVehicleItemByName(fetchedEngines, vehicle.engine);
        } else {
          const fallbackRes = await getEngineTypes(jwt);
          const fallbackEngines = fallbackRes.data || [];
          setEngineOptions(fallbackEngines);
          setUsingEngineTypeFallback(true);
          engineObj = vehicle.engineTypeMaster
            ? fallbackEngines.find(
                (engineItem) =>
                  engineItem.documentId === vehicle.engineTypeMaster?.documentId
              )
            : findVehicleItemByName(fallbackEngines, vehicle.engine);
        }
      }

      const updatedData: QuoteRequestFormData = {
        ...formData,
        userVehicle: vehicle.id.toString(),
        brand: brandObj.documentId,
        model: modelObj?.documentId || "",
        year: vehicle.year,
        engine: engineObj?.documentId || "",
        version: vehicle.version || vehicle.engine || "-",
      };

      setFormData(updatedData);

      saveDraft(updatedData);
    }
  };

  const handleBrandChange = async (
    eOrValue: React.ChangeEvent<HTMLSelectElement> | string
  ) => {
    const brandId =
      typeof eOrValue === "string" ? eOrValue : eOrValue.target.value;
    setFormData({
      ...formData,
      userVehicle: "",
      brand: brandId,
      model: "",
      year: 0,
      engine: "",
      version: "",
    });
    setModels([]);
    setEngineOptions([]);
    setUsingEngineTypeFallback(false);
    if (!brandId) return;
    const selectedBrand = brands.find((b) => b.documentId === brandId);
    if (selectedBrand) {
      const res = await getModelsByBrand(jwt, selectedBrand.documentId);
      setModels(res.data || []);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const nextData = { ...formData, [name]: value };

    if (name === "model") {
      nextData.year = 0;
      nextData.engine = "";
      nextData.version = "";
      setEngineOptions([]);
      setUsingEngineTypeFallback(false);
    }

    if (name === "engine") {
      const engineObj = engineOptions.find((engineItem) => engineItem.documentId === value);
      nextData.version = engineObj?.name || "";
    }

    setFormData(nextData);
  };

  const handleSearchableSelectChange = (name: "model" | "engine") => {
    return (value: string) => {
      const event = {
        target: { name, value },
      } as React.ChangeEvent<HTMLSelectElement>;

      handleChange(event);
    };
  };

  useEffect(() => {
    if (!jwt || !formData.model) {
      setEngineOptions([]);
      setUsingEngineTypeFallback(false);
      return;
    }

    const loadEngineOptions = async () => {
      try {
        const res = await getModelEnginesByModel(jwt, formData.model);
        const fetchedEngines = res.data || [];

        if (fetchedEngines.length > 0) {
          setEngineOptions(fetchedEngines);
          setUsingEngineTypeFallback(false);
          return;
        }

        const fallbackRes = await getEngineTypes(jwt);
        setEngineOptions(fallbackRes.data || []);
        setUsingEngineTypeFallback(true);
      } catch (error) {
        console.error(error);
        try {
          const fallbackRes = await getEngineTypes(jwt);
          setEngineOptions(fallbackRes.data || []);
          setUsingEngineTypeFallback(true);
        } catch (fallbackError) {
          console.error(fallbackError);
          setEngineOptions([]);
          setUsingEngineTypeFallback(false);
        }
      }
    };

    loadEngineOptions();
  }, [formData.model, jwt]);

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
      const engineObj = engineOptions.find((e) => e.documentId === formData.engine);

      const payload = {
        brandId: brandObj?.id,
        modelId: modelObj?.id,
        engine: engineObj?.name || formData.engine,
        version: engineObj?.name || formData.version || "-",
        year: Number(formData.year),
        ...(usingEngineTypeFallback
          ? { engineTypeId: engineObj?.id }
          : { modelEngineId: engineObj?.id }),
      };

      const res = await createVehicle(jwt, payload);

      if (res.error) throw new Error("Error al guardar el vehículo");

      const newList = await refreshVehicles();

      if (newList && newList.length > 0) {
        const mostRecentId = newList[0].id.toString();

        setFormData((prev) => ({
          ...prev,
          userVehicle: mostRecentId,
          brand: formData.brand,
          model: formData.model,
          year: formData.year,
          engine: formData.engine,
          version: formData.version,
        }));
      }

      goToList();
      toast.success(
        `Vehículo agregado con éxito. Puede ver su lista actualizada de vehículos en la sección "Vehículos" de su perfil`,
        { duration: 10000 }
      );
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
    <section className={styles.cardVehicleStep} ref={sectionRef}>
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Car />
          </div>
        </div>

        <h2 className={styles.cardTitle}>Datos del Vehículo</h2>
        {isCompleted && (
          <div className={styles.stepCompletedBadge}>
            <IconsApp.Check />
          </div>
        )}

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
                        {loadingInitial
                          ? "Cargando..."
                          : "No tiene vehículos registrados"}
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
                              {v.engine}
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
                <label>Marca <span className={styles.required}>*</span></label>
                <SearchableSelect
                  placeholder="Seleccionar Marca"
                  value={formData.brand}
                  options={brands.map((brand) => ({
                    id: brand.documentId,
                    label: brand.name,
                  }))}
                  onChange={(value) =>
                    handleBrandChange(value)
                  }
                  searchPlaceholder="Buscar marca..."
                  noResultsText="No hay marcas"
                />
              </div>

              <div className={styles.field}>
                <label>Modelo <span className={styles.required}>*</span></label>
                <SearchableSelect
                  placeholder={
                    formData.brand ? "Seleccionar Modelo" : "Primero elija marca"
                  }
                  value={formData.model}
                  options={models.map((model) => ({
                    id: model.documentId,
                    label: model.name,
                  }))}
                  onChange={handleSearchableSelectChange("model")}
                  disabled={!formData.brand}
                  searchPlaceholder="Buscar modelo..."
                  noResultsText="No hay modelos"
                />
              </div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label>Año <span className={styles.required}>*</span></label>
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
                  <label>Motor <span className={styles.required}>*</span></label>
                  <SearchableSelect
                    placeholder={
                      engineOptions.length > 0
                        ? "Seleccionar Motor"
                        : "Sin motores registrados"
                    }
                    value={formData.engine}
                    options={engineOptions.map((engine) => ({
                      id: engine.documentId,
                      label: engine.name,
                    }))}
                    onChange={handleSearchableSelectChange("engine")}
                    disabled={!formData.model || engineOptions.length === 0}
                    searchPlaceholder="Buscar motor..."
                    noResultsText="No hay motores"
                  />
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
      {showError && (
        <p className={styles.submitError}>
          Selecciona un vehículo para continuar.
        </p>
      )}
    </section>
  );
}
