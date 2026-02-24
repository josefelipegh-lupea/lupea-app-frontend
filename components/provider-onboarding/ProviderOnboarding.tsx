"use client";

import React, { useState, ChangeEvent, useRef, useEffect } from "react";
import { ProviderFormData } from "./types";
import StepBasics from "@/components/provider-onboarding/steps/StepBasics";
import StepClassification from "@/components/provider-onboarding/steps/StepClassification";
import StepDocuments from "@/components/provider-onboarding/steps/StepDocuments";
import StepTransition from "./step-transition/StepTransition";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useBasicsValidation } from "@/hooks/useBasicsValidation";
import { useClassificationValidation } from "@/hooks/useClassificationValidation";
import { useDocumentsValidation } from "@/hooks/useDocumentsValidation";
import Button from "../button/Button";
import Header from "../header/Header";
import { useAuth } from "@/context/AuthContext";
import { ProviderProfile } from "@/app/lib/api/vendor/vendorProfile";
import toast from "react-hot-toast";

import styles from "./ProviderOnboarding.module.css";

const ProviderOnboarding: React.FC = () => {
  const { profile, role, refreshProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {}
  );

  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { isExpanded } = useSidebar();

  const [formData, setFormData] = useState<ProviderFormData>({
    username: "",
    email: "",
    business_name: "",
    phone: "",
    categories: [],
    brands: [],
    business_photos: [],
  });

  // 1. Sincronizar datos iniciales desde el AuthContext
  useEffect(() => {
    if (role === "provider" && profile) {
      const p = profile as ProviderProfile;
      setFormData((prev) => ({
        ...prev,
        business_name: p.businessName || "",
        // Mapear el resto de campos que vengan del perfil
      }));
    }
  }, [profile, role]);

  const basics = useBasicsValidation(formData);
  const classification = useClassificationValidation(formData);
  const documents = useDocumentsValidation(selectedFiles);

  const paginate = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return basics.isValid;
    if (currentStep === 2) return classification.isValid;
    if (currentStep === 3) return documents.isValid;
    return false;
  };

  // 2. Lógica de guardado final
  const handleFinalSave = async () => {
    const jwt = localStorage.getItem("jwt");
    if (!jwt) return;

    setIsSaving(true);
    try {
      // Llamada a tu API de proveedor con los datos recolectados

      // Refrescamos el contexto global para que el Header/Sidebar se enteren de los cambios
      await refreshProfile();

      toast.success("Perfil de proveedor actualizado");
      router.push("/profile/vendor"); // Redirigir al dashboard de proveedor
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la información");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      paginate(currentStep + 1);
    } else {
      handleFinalSave();
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const getStepTitle = () => {
    if (currentStep === 1) return "Información Personal";
    if (currentStep === 2) return "Información Comercial";
    return "Documentación Legal";
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [currentStep]);

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer} ref={cardRef}>
        <Header
          onBack={() => currentStep > 1 && paginate(currentStep - 1)}
          title={getStepTitle()}
        />

        <div className={styles.content}>
          {/* Stepper Visual */}
          <div className={styles.stepperContainer}>
            {[1, 2, 3].map((step) => (
              <div key={step} className={styles.stepWrapper}>
                <div
                  className={`${styles.stepNumber} ${
                    currentStep >= step ? styles.stepActive : ""
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`${styles.stepLine} ${
                      currentStep > step ? styles.lineActive : ""
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className={styles.stepContent}>
            <StepTransition stepKey={currentStep} direction={direction}>
              {currentStep === 1 && (
                <StepBasics
                  formData={formData}
                  handleChange={handleChange}
                  setFormData={setFormData}
                />
              )}
              {currentStep === 2 && (
                <StepClassification
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
                />
              )}
              {currentStep === 3 && (
                <StepDocuments
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                />
              )}
            </StepTransition>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              className={`${styles.btnSave} ${
                !isCurrentStepValid() || isSaving
                  ? styles.btnDisabled
                  : styles.btnActive
              }`}
              onClick={handleNextStep}
              disabled={!isCurrentStepValid() || isSaving}
            >
              {isSaving
                ? "Guardando..."
                : currentStep === 3
                ? "Guardar cambios"
                : "Siguiente paso"}
            </Button>

            <button
              className={styles.btnCancel}
              onClick={() => router.back()}
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
