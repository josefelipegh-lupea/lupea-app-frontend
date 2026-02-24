"use client";

import { useState, useEffect } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "./Vehicles.module.css";
import { useSidebar } from "@/context/SidebarContext";
import { useVehicleValidation } from "@/hooks/useVehicleValidation";
import Button from "@/components/button/Button";
import Header from "@/components/header/Header";
import InputField from "@/components/input/InputField";
import toast from "react-hot-toast";
import {
  createVehicle,
  deleteVehicle,
  getClientVehicles,
  updateVehicle,
  Vehicle,
} from "@/app/lib/api/client/vehicle";
import StepTransition from "@/components/provider-onboarding/step-transition/StepTransition";

const VehiclesPage = () => {
  const { isExpanded } = useSidebar();
  const [currentStep, setCurrentStep] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [direction, setDirection] = useState(1);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Lista de vehículos de la API
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: 0,
    version: "",
    engine: "",
  });

  // Hook de validación basado en Zod
  const { isValid } = useVehicleValidation(formData);
  const currentYearPlaceholder = new Date().getFullYear().toString();

  // 1. Cargar vehículos
  const fetchVehicles = async () => {
    const jwt = localStorage.getItem("jwt");
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

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Navegación y limpieza
  const handleAddNew = () => {
    setDirection(1);
    setEditingId(null);
    setFormData({ brand: "", model: "", version: "", year: 0, engine: "" });
    setCurrentStep(1);
  };

  const handleEditClick = (vehicle: Vehicle) => {
    setDirection(1);
    setEditingId(vehicle.id);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      version: vehicle.version,
      year: vehicle.year,
      engine: vehicle.engine,
    });
    setCurrentStep(1);
  };

  const goBack = () => {
    setDirection(-1);
    setCurrentStep(0);
    setEditingId(null);
  };

  // Operaciones API
  const handleSave = async () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setIsSaving(true);
    try {
      const payload = { ...formData, year: formData.year || 0 };

      if (editingId) {
        await updateVehicle(jwt, editingId, payload);
        toast.success("Vehículo actualizado");
      } else {
        await createVehicle(jwt, payload);
        toast.success("Vehículo agregado");
      }

      await fetchVehicles();
      goBack();
    } catch (error) {
      toast.error("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setIsSaving(true);
    try {
      await deleteVehicle(jwt, editingId);
      setShowDeleteConfirm(false);
      setCurrentStep(0);
      setSavedVehicles((prev) => prev.filter((v) => v.id !== editingId));
      toast.success("Vehículo eliminado");
      goBack();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar";
      toast.error(msg);
    } finally {
      setIsSaving(false);
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
              ? "Mis Vehículos"
              : editingId
              ? "Editar Vehículo"
              : "Nuevo Vehículo"
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
              /* PASO 0: LISTADO */
              <div className={styles.listWrapper}>
                {isLoading ? (
                  <div className={styles.loader}>Cargando vehículos...</div>
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
                              <IconsApp.Business />
                            </div>
                            <div className={styles.info}>
                              <h3>
                                {vehicle.brand} {vehicle.model}
                              </h3>
                              <p>
                                {vehicle.year} • {vehicle.version} • Motor{" "}
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
                      onClick={handleAddNew}
                    >
                      <span className={styles.addIcon}>+</span> Agregar nuevo
                      vehículo
                    </Button>
                  </>
                )}
              </div>
            ) : (
              /* PASO 1: FORMULARIO */
              <div className={styles.layoutContent}>
                <div className={styles.columnLeft}>
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Marca</label>
                    <InputField
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      placeholder="Ej: Toyota"
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Modelo</label>
                    <InputField
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Ej: Corolla"
                    />
                  </div>
                  <div className={styles.inputContainer}>
                    <label className={styles.label}>Versión</label>
                    <InputField
                      name="version"
                      value={formData.version}
                      onChange={handleChange}
                      placeholder="Ej: Full"
                    />
                  </div>
                </div>

                <div className={styles.columnRight}>
                  <div className={styles.row}>
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Año</label>
                      <InputField
                        name="year"
                        value={formData.year === 0 ? "" : formData.year}
                        onChange={handleChange}
                        placeholder={currentYearPlaceholder}
                      />
                    </div>
                    <div className={styles.inputContainer}>
                      <label className={styles.label}>Motor</label>
                      <InputField
                        name="engine"
                        value={formData.engine}
                        onChange={handleChange}
                        placeholder="2.0"
                      />
                    </div>
                  </div>

                  <div className={styles.buttonGroup}>
                    <Button
                      className={styles.btnSave}
                      onClick={handleSave}
                      disabled={!isValid || isSaving}
                    >
                      {isSaving ? "Guardando..." : "Guardar"}
                    </Button>
                  </div>
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
            <h3>¿Eliminar vehículo?</h3>
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
};

export default VehiclesPage;
