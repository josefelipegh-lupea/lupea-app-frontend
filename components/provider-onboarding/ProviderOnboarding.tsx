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

import styles from "./ProviderOnboarding.module.css";

const ProviderOnboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<Record<string, string>>(
    {}
  );
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<ProviderFormData>({
    username: "",
    email: "",
    business_name: "",
    phone: "",
    categories: [],
    brands: [],
    business_photos: [],
  });

  const { isExpanded } = useSidebar();

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

  const handleNextStep = () => {
    if (currentStep < 3) {
      paginate(currentStep + 1);
    } else {
      console.log("Finalizar", formData);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Títulos dinámicos por paso adaptados a tu header central
  const getStepTitle = () => {
    if (currentStep === 1) return "Información Personal";
    if (currentStep === 2) return "Información Comercial";
    return "Documentación Legal";
  };

  // Lógica de scroll automático al cambiar de paso
  useEffect(() => {
    // Usamos setTimeout para esperar al siguiente ciclo del event loop
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
              className={`${styles.btnSave} ${styles.btnActive} ${
                !isCurrentStepValid() ? styles.btnDisabled : styles.btnActive
              }`}
              onClick={handleNextStep}
              disabled={!isCurrentStepValid()}
            >
              {currentStep === 3 ? "Guardar cambios" : "Siguiente paso"}
            </Button>

            <button className={styles.btnCancel} onClick={() => router.back()}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderOnboarding;
