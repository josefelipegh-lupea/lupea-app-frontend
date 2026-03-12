"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import Header from "@/components/header/Header";
import Button from "@/components/button/Button";
import StepLocationProvider from "@/components/provider-onboarding/steps/StepLocationProvider";
import { LocationValues } from "@/app/lib/api/client/location";
import toast from "react-hot-toast";
import styles from "./ProviderLocation.module.css"; // Tu CSS adaptado
import stylesBasics from "../basics/Basics.module.css"; // Contenedores globales
import {
  addProviderLocation,
  CreateLocationDTO,
  deleteProviderLocation,
  getProviderLocations,
  ProviderLocation,
  updateProviderLocation,
} from "@/app/lib/api/vendor/location";
import StepTransition from "@/components/provider-onboarding/step-transition/StepTransition";
import { ConfirmModal } from "@/components/confirm-modal/ConfirmModal";

export default function LocationsProviderPage() {
  const { jwt, isLoading: authLoading } = useAuth();
  const { isExpanded } = useSidebar();

  // Estados de navegación y datos
  const [currentStep, setCurrentStep] = useState(0); // 0: Lista, 1: Formulario
  const [direction, setDirection] = useState(1);
  const [savedLocations, setSavedLocations] = useState<ProviderLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Estado para el formulario (compatible con StepLocationProvider)
  const [formData, setFormData] = useState<LocationValues>({
    name: "",
    type: "branch",
    state: "",
    municipality: "",
    parish: "",
    address: "",
    exactAddress: "",
    latitude: 10.4806,
    longitude: -66.8983,
    placeId: "",
  });

  const fetchLocations = async () => {
    if (!jwt) return;
    try {
      setIsLoading(true);
      const res = await getProviderLocations(jwt);
      setSavedLocations(res.data);
      console.log(res);
    } catch (error) {
      toast.error("Error al cargar ubicaciones");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [jwt]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: "",
      type: "branch",
      state: "",
      municipality: "",
      parish: "",
      address: "",
      exactAddress: "",
      latitude: 10.4806,
      longitude: -66.8983,
      placeId: "",
    });
    setDirection(1);
    setCurrentStep(1);
  };

  const handleEdit = (loc: ProviderLocation) => {
    setEditingId(loc.id);
    setFormData({
      name: loc.name,
      type: loc.type,
      state: loc.state,
      municipality: loc.municipality,
      parish: loc.parish,
      address: loc.address,
      exactAddress: loc.exactAddress,
      latitude: Number(loc.latitude),
      longitude: Number(loc.longitude),
      placeId: loc.placeId,
    });
    setDirection(1);
    setCurrentStep(1);
  };

  const handleSave = async () => {
    if (!jwt) return;
    setIsSaving(true);

    try {
      if (editingId) {
        // MODO EDICIÓN (PUT)
        await updateProviderLocation(
          jwt,
          editingId,
          formData as CreateLocationDTO
        );
        toast.success("Ubicación actualizada correctamente");
      } else {
        // MODO CREACIÓN (POST)
        await addProviderLocation(jwt, formData as CreateLocationDTO);
        toast.success("Ubicación guardada con éxito");
      }

      // Refrescar lista y volver
      await fetchLocations();
      setDirection(-1);
      setCurrentStep(0);
    } catch (error) {
      console.error(error);
      toast.error(editingId ? "No se pudo actualizar" : "No se pudo guardar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!jwt || !editingId) return;
    try {
      await deleteProviderLocation(jwt, editingId);
      toast.success("Ubicación eliminada");
      setShowDeleteConfirm(false);
      fetchLocations();
      setCurrentStep(0);
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  return (
    <div
      className={`${stylesBasics.pageWrapper} ${
        !isExpanded ? stylesBasics.sidebarCollapsed : ""
      }`}
    >
      <div className={stylesBasics.mainContainer}>
        <Header
          title={
            currentStep === 0
              ? "Mis Sedes"
              : editingId
              ? "Editar Sede"
              : "Nueva Sede"
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
                  <div className={styles.loader}>Cargando sedes...</div>
                ) : (
                  <>
                    <div className={styles.listContainer}>
                      {savedLocations.length === 0 ? (
                        <p className={styles.emptyState}>
                          No tienes sedes registradas.
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
                              <h4>{loc.name}</h4>
                              <p>
                                {loc.municipality}, {loc.state}
                              </p>
                            </div>
                            <IconsApp.RightArrow color="#9ca3af" />
                          </div>
                        ))
                      )}
                    </div>
                    <Button onClick={handleAddNew}>+ Agregar nueva sede</Button>
                  </>
                )}
              </div>
            ) : (
              <div className={styles.stepWrapper}>
                {/* Reutilizamos tu componente de lógica pesada */}
                <StepLocationProvider
                  jwt={jwt}
                  locationData={formData}
                  setLocationData={setFormData}
                  onSuccess={() => {}}
                />

                <div
                  className={styles.buttonGroup}
                  style={{ marginTop: "24px" }}
                >
                  <Button
                    onClick={handleSave}
                    disabled={
                      isSaving ||
                      !formData.name ||
                      !formData.state ||
                      !formData.exactAddress
                    }
                  >
                    {isSaving
                      ? "Guardando..."
                      : editingId
                      ? "Actualizar Cambios"
                      : "Guardar Ubicación"}
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
        description="Esta sede dejará de estar visible en tu perfil."
      />
    </div>
  );
}
