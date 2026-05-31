"use client";

import { useState, useEffect, useMemo } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./Vehicles.module.css";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext"; // Usando tu context
import Button from "@/components/button/Button";
import Header from "@/components/header/Header";
import toast from "react-hot-toast";
import {
  createVehicle,
  deleteVehicle,
  getBrands,
  getClientVehicles,
  getEngineTypes,
  getModelEnginesByModel,
  getModelsByBrand,
  updateVehicle,
  Vehicle,
  VehicleItem,
} from "@/app/lib/api/client/vehicle";
import StepTransition from "@/components/provider-onboarding/step-transition/StepTransition";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";

const VehiclesPage = () => {
  const { isExpanded } = useSidebar();
  const { jwt } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [loadingEngines, setLoadingEngines] = useState(false);
  const [usingEngineTypeFallback, setUsingEngineTypeFallback] = useState(false);

  const [brands, setBrands] = useState<VehicleItem[]>([]);
  const [models, setModels] = useState<VehicleItem[]>([]);
  const [engines, setEngines] = useState<VehicleItem[]>([]);
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    version: "",
    engine: "",
  });

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 35 }, (_, i) => (currentYear - i).toString());
  }, []);

  // 1. Cargar Vehículos del usuario
  const fetchVehicles = async () => {
    if (!jwt) return;
    try {
      const res = await getClientVehicles(jwt);
      setSavedVehicles(res.data);
    } catch (error) {
      toast.error("Error al obtener vehículos");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Carga inicial de Marcas
  useEffect(() => {
    if (!jwt) return;
    const loadInitialData = async () => {
      try {
        const brandsRes = await getBrands(jwt);
        setBrands(brandsRes.data);
      } catch (error) {
        console.error("Error inicial:", error);
      }
    };
    loadInitialData();
    fetchVehicles();
  }, [jwt]);

  // 3. Carga de Modelos por Marca (Cascada API)
  useEffect(() => {
    if (!jwt || !formData.brand) {
      setModels([]);
      setEngines([]);
      return;
    }

    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const selectedBrand = brands.find(
          (b) => b.documentId === formData.brand
        );
        if (selectedBrand) {
          const res = await getModelsByBrand(jwt, selectedBrand.documentId);
          setModels(res.data || []);
        }
      } catch (error) {
        console.error("Error modelos:", error);
      } finally {
        setLoadingModels(false);
      }
    };
    loadModels();
  }, [formData.brand, jwt, brands]);

  useEffect(() => {
    if (!jwt || !formData.model) {
      setEngines([]);
      setUsingEngineTypeFallback(false);
      return;
    }

    const loadEngines = async () => {
      setLoadingEngines(true);
      try {
        const res = await getModelEnginesByModel(jwt, formData.model);
        const fetchedEngines = res.data || [];

        if (fetchedEngines.length > 0) {
          setEngines(fetchedEngines);
          setUsingEngineTypeFallback(false);
          return;
        }

        const fallbackRes = await getEngineTypes(jwt);
        setEngines(fallbackRes.data || []);
        setUsingEngineTypeFallback(true);
      } catch (error) {
        console.error("Error motores:", error);
        try {
          const fallbackRes = await getEngineTypes(jwt);
          setEngines(fallbackRes.data || []);
          setUsingEngineTypeFallback(true);
        } catch (fallbackError) {
          console.error("Error fallback motores:", fallbackError);
          setEngines([]);
          setUsingEngineTypeFallback(false);
        }
      } finally {
        setLoadingEngines(false);
      }
    };

    loadEngines();
  }, [formData.model, jwt]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "brand") {
        newData.model = "";
        newData.year = "";
        newData.engine = "";
        newData.version = "";
        setUsingEngineTypeFallback(false);
      }
      if (name === "model") {
        newData.year = "";
        newData.engine = "";
        newData.version = "";
        setUsingEngineTypeFallback(false);
      }
      if (name === "engine") {
        newData.version = engines.find((engineItem) => engineItem.documentId === value)?.name || "";
      }

      return newData;
    });
  };

  const isFormValid =
    formData.brand &&
    formData.model &&
    formData.year &&
    formData.engine;

  const handleSave = async () => {
    if (!jwt) return;
    setIsSaving(true);
    try {
      const brandObj = brands.find((b) => b.documentId === formData.brand);
      const modelObj = models.find((m) => m.documentId === formData.model);
      const engineObj = engines.find((e) => e.documentId === formData.engine);

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

      if (editingId) {
        await updateVehicle(jwt, editingId, payload);
        toast.success("Vehículo actualizado");
      } else {
        await createVehicle(jwt, payload);
        toast.success("Vehículo guardado");
      }
      await fetchVehicles();
      goBack();
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.error("Error al guardar el vehículo");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !jwt) return;
    try {
      await deleteVehicle(jwt, editingId);
      toast.success("Eliminado correctamente");
      setSavedVehicles((prev) => prev.filter((v) => v.id !== editingId));
      setShowDeleteConfirm(false);
      goBack();
    } catch (error) {
      toast.error("No se pudo eliminar");
    }
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(0);
    setEditingId(null);
    setFormData({ brand: "", model: "", version: "", year: "", engine: "" });
    setModels([]);
    setEngines([]);
    setUsingEngineTypeFallback(false);
  };

  const handleEditClick = async (vehicle: Vehicle) => {
    setDirection(1);
    setEditingId(vehicle.id);

    // 1. Obtener el token del contexto (o localStorage si prefieres)
    const currentJwt = jwt || localStorage.getItem("jwt");
    if (!currentJwt) return;

    const brandObj = vehicle.brandMaster
      ? brands.find((b) => b.documentId === vehicle.brandMaster?.documentId)
      : brands.find((b) => b.name === vehicle.brand);

    if (brandObj) {
      setLoadingModels(true);
      try {
        const res = await getModelsByBrand(currentJwt, brandObj.documentId);
        const fetchedModels: VehicleItem[] = res.data || [];
        setModels(fetchedModels);
        const modelId = vehicle.modelMaster
          ? fetchedModels.find(
              (m) => m.documentId === vehicle.modelMaster?.documentId
            )?.documentId || ""
          : fetchedModels.find((m) => m.name === vehicle.model)?.documentId || "";

        let engineId = "";
        if (modelId) {
          setLoadingEngines(true);
          const engineRes = await getModelEnginesByModel(currentJwt, modelId);
          const fetchedEngines: VehicleItem[] = engineRes.data || [];

          if (fetchedEngines.length > 0) {
            setEngines(fetchedEngines);
            setUsingEngineTypeFallback(false);
            engineId = vehicle.modelEngineMaster
              ? fetchedEngines.find(
                  (engineItem) =>
                    engineItem.documentId === vehicle.modelEngineMaster?.documentId
                )?.documentId || ""
              : fetchedEngines.find((engineItem) => engineItem.name === vehicle.engine)
                  ?.documentId || "";
          } else {
            const fallbackRes = await getEngineTypes(currentJwt);
            const fallbackEngines: VehicleItem[] = fallbackRes.data || [];
            setEngines(fallbackEngines);
            setUsingEngineTypeFallback(true);
            engineId = vehicle.engineTypeMaster
              ? fallbackEngines.find(
                  (engineItem) =>
                    engineItem.documentId === vehicle.engineTypeMaster?.documentId
                )?.documentId || ""
              : fallbackEngines.find((engineItem) => engineItem.name === vehicle.engine)
                  ?.documentId || "";
          }
        }

        setFormData({
          brand: brandObj.documentId,
          model: modelId,
          version: vehicle.version,
          year: vehicle.year.toString(),
          engine: engineId,
        });
      } catch (error) {
        toast.error("Error al cargar los modelos del vehículo");
        console.error(error);
      } finally {
        setLoadingModels(false);
        setLoadingEngines(false);
      }
    }

    setCurrentStep(1);
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
              ? "Mis Vehículos"
              : editingId
              ? "Editar Vehículo"
              : "Nuevo Vehículo"
          }
          onBack={currentStep === 1 ? goBack : undefined}
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
              <div className={styles.listWrapper}>
                {isLoading ? (
                  <div className={styles.loader}>Cargando...</div>
                ) : (
                  <>
                    <div className={styles.listContainer}>
                      {savedVehicles.length === 0 ? (
                        <p className={styles.emptyState}>
                          No tienes vehículos registrados.
                        </p>
                      ) : (
                        savedVehicles.map((vehicle) => (
                          <div
                            key={vehicle.id}
                            className={styles.vehicleCard}
                            onClick={() => handleEditClick(vehicle)}
                          >
                            <div className={styles.iconWrapper}>
                              <IconsApp.Car />
                            </div>
                            <div className={styles.info}>
                              <h3>
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p>
                                {vehicle.year} • {vehicle.engine}
                              </p>
                            </div>
                            <IconsApp.RightArrow />
                          </div>
                        ))
                      )}
                    </div>
                    <Button
                      className={styles.addVehicleBtn}
                      onClick={() => {
                        setDirection(1);
                        setCurrentStep(1);
                      }}
                    >
                      <span className={styles.addIcon}>+</span> Agregar nuevo
                      vehículo
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.formBody}>
                <div className={styles.layoutContent}>
                  {/* MARCA */}
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Marca <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className={styles.input}
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

                  {/* MODELO */}
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Modelo <span className={styles.required}>*</span></label>
                    <div className={styles.selectWrapper}>
                      <select
                        name="model"
                        value={formData.model}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={!formData.brand || loadingModels}
                      >
                        <option value="">
                          {loadingModels ? "Cargando..." : "Seleccionar Modelo"}
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

                  <div className={styles.row}>
                    {/* AÑO */}
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Año <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrapper}>
                        <select
                          name="year"
                          value={formData.year}
                          onChange={handleChange}
                          className={styles.input}
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

                    {/* MOTOR */}
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Motor <span className={styles.required}>*</span></label>
                      <div className={styles.selectWrapper}>
                        <select
                          name="engine"
                          value={formData.engine}
                          onChange={handleChange}
                          className={styles.input}
                          disabled={!formData.model || loadingEngines || engines.length === 0}
                        >
                          <option value="">
                            {loadingEngines
                              ? "Cargando..."
                              : engines.length > 0
                                ? "Seleccionar Motor"
                                : "Sin motores registrados"}
                          </option>
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
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    onClick={handleSave}
                    disabled={!isFormValid || isSaving}
                    className={
                      !isFormValid ? styles.buttonDisabled : styles.buttonActive
                    }
                  >
                    {isSaving
                      ? "Guardando..."
                      : editingId
                      ? "Actualizar Cambios"
                      : "Guardar Vehículo"}
                  </Button>
                  <button className={styles.btnCancel} onClick={goBack}>
                    Cancelar
                  </button>
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
        title="¿Eliminar vehículo?"
        description="Este vehículo se borrará permanentemente de tu lista."
      />
    </div>
  );
};

export default VehiclesPage;
