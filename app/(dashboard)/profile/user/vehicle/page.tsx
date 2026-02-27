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
  getModelsByBrand,
  updateVehicle,
  Vehicle,
  VehicleItem,
} from "@/app/lib/api/client/vehicle";
import StepTransition from "@/components/provider-onboarding/step-transition/StepTransition";

// Datos estáticos para versiones (puedes mover esto a un archivo de constantes)
export const VERSIONS = [
  "LE",
  "SE",
  "XSE",
  "SR",
  "SRV",
  "Limited",
  "Touring",
  "Standard",
];

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

  // 2. Carga inicial de Marcas y Motores
  useEffect(() => {
    if (!jwt) return;
    const loadInitialData = async () => {
      try {
        const [brandsRes, enginesRes] = await Promise.all([
          getBrands(jwt),
          getEngineTypes(jwt),
        ]);
        setBrands(brandsRes.data);
        setEngines(enginesRes.data);
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
      return;
    }

    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const selectedBrand = brands.find(
          (b) => b.documentId === formData.brand
        );
        if (selectedBrand) {
          const res = await getModelsByBrand(jwt, selectedBrand.name);
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

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };

      if (name === "brand") {
        newData.model = "";
        newData.version = "";
        newData.year = "";
        newData.engine = "";
      }
      if (name === "version") {
        newData.year = "";
        newData.engine = "";
      }
      if (name === "model") {
        newData.version = "";
        newData.year = "";
        newData.engine = "";
      }
      if (name === "year") {
        newData.engine = "";
      }

      return newData;
    });
  };

  const isFormValid =
    formData.brand &&
    formData.model &&
    formData.version &&
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
        brand: brandObj?.name || formData.brand,
        model: modelObj?.name || formData.model,
        engine: engineObj?.name || formData.engine,
        version: formData.version,
        year: Number(formData.year),
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
  };

  const handleEditClick = async (vehicle: Vehicle) => {
    setDirection(1);
    setEditingId(vehicle.id);

    // 1. Obtener el token del contexto (o localStorage si prefieres)
    const currentJwt = jwt || localStorage.getItem("jwt");
    if (!currentJwt) return;

    // 2. Traducir nombres de Marca y Motor a IDs (ya están en memoria)
    const brandObj = brands.find((b) => b.name === vehicle.brand);
    const engineId =
      engines.find((e) => e.name === vehicle.engine)?.documentId || "";

    if (brandObj) {
      setLoadingModels(true);
      try {
        // 3. Cargar modelos de forma imperativa para poder buscar el ID del modelo actual
        const res = await getModelsByBrand(currentJwt, brandObj.name);
        const fetchedModels: VehicleItem[] = res.data || [];

        // Actualizamos el estado global de modelos para que el select tenga opciones
        setModels(fetchedModels);

        // 4. Buscar el ID del modelo dentro de la lista recién traída
        const modelId =
          fetchedModels.find((m) => m.name === vehicle.model)?.documentId || "";

        // 5. Seteamos el formulario con todos los IDs encontrados
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
                                {vehicle.year} • {vehicle.version || "N/A"} •{" "}
                                {vehicle.engine}
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
                    <label className={styles.label}>Marca</label>
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
                    <label className={styles.label}>Modelo</label>
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

                  {/* VERSIÓN (Depende de Marca y Modelo) */}
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Versión</label>
                    <div className={styles.selectWrapper}>
                      <select
                        name="version"
                        value={formData.version}
                        onChange={handleChange}
                        className={styles.input}
                        disabled={!formData.model}
                      >
                        <option value="">Seleccionar Versión</option>
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
                    {/* AÑO */}
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Año</label>
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
                      <label className={styles.label}>Motor</label>
                      <div className={styles.selectWrapper}>
                        <select
                          name="engine"
                          value={formData.engine}
                          onChange={handleChange}
                          className={styles.input}
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

      {/* MODAL DE ELIMINACIÓN */}
      {showDeleteConfirm && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className={styles.floatingCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>¿Eliminar vehículo?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <button
              className={styles.confirmDeleteBtn}
              onClick={handleDelete}
              disabled={isSaving}
            >
              {isSaving ? "Eliminando..." : "Sí, eliminar"}
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
};

export default VehiclesPage;
