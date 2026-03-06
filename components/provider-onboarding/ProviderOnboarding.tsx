"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

import Header from "../header/Header";
import Button from "../button/Button";
import StepTransition from "./step-transition/StepTransition";
import StepBasics from "./steps/StepBasics";
import StepClassification from "./steps/StepClassification";
import StepDocuments from "./steps/StepDocuments";

import { ProviderFormData } from "./types";
import { useBasicsValidation } from "@/hooks/useBasicsValidation";
import { useClassificationValidation } from "@/hooks/useClassificationValidation";
import { useDocumentsValidation } from "@/hooks/useDocumentsValidation";
import styles from "./ProviderOnboarding.module.css";
import StepLocationProvider from "./steps/StepLocationProvider";
import { useCommercialValidation } from "@/hooks/useCommercialValidation";
import StepCommercialTerms from "./steps/StepCommercialTerms";
import { createLocationProvider } from "@/app/lib/api/vendor/location";
import {
  updateProviderProfile,
  UpdateProviderProfileDTO,
  uploadProviderDocument,
} from "@/app/lib/api/vendor/vendorProfile";
import { LocationValues } from "@/app/lib/api/client/location";

const STORAGE_KEY = "provider_onboarding_data";
const LOCATION_STORAGE_KEY = "provider_onboarding_location";

const ProviderOnboarding: React.FC = () => {
  const { profile, jwt } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{
    [key: string]: File | null;
  }>({});

  const [locationData, setLocationData] = useState<LocationValues | null>(null);

  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const { isExpanded } = useSidebar();

  const [formData, setFormData] = useState<ProviderFormData>({
    username: profile?.username || "",
    email: profile?.email || "",
    businessName: "",
    phone: "",
    mainCategories: [],
    brands: [],
    businessPhotos: [],
    paymentMethods: [],
    warrantyPolicy: "",
    returnPolicy: "",
    hasStorePickup: false,
    hasLocalDelivery: false,
    hasNationalDelivery: false,
    shippingCarriers: [],
  });

  const basics = useBasicsValidation(formData);
  const classification = useClassificationValidation(formData);
  const documents = useDocumentsValidation(selectedFiles);
  const comercial = useCommercialValidation(formData);

  // 1. Cargar datos persistidos al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (savedData) setFormData(JSON.parse(savedData));
    if (savedLocation) setLocationData(JSON.parse(savedLocation));
  }, []);

  // 2. Persistir formData cuando cambie
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleSetLocation = (data: LocationValues) => {
    setLocationData(data);
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(data));
  };

  const paginate = (newStep: number) => {
    setDirection(newStep > currentStep ? 1 : -1);
    setCurrentStep(newStep);
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return basics.isValid;
    if (currentStep === 2) return classification.isValid;
    if (currentStep === 3) return documents.isValid;
    if (currentStep === 4) return !!locationData;
    if (currentStep === 5) return comercial.isValid;
    return false;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === "phone") {
      const cleanNumbers = value.replace(/\D/g, "");
      newValue = value.startsWith("+58")
        ? "+58" + value.substring(3).replace(/\D/g, "")
        : "+58" + cleanNumbers;
      if (newValue.length > 14) return;
    }
    setFormData({ ...formData, [name]: newValue });
  };

  const handleNextStep = async () => {
    if (currentStep < 5) {
      paginate(currentStep + 1);
    } else {
      if (!jwt || !locationData) return;
      setIsSaving(true);
      try {
        // A. Primero crear la localización (sede)
        await createLocationProvider(jwt, locationData);

        // B. Actualizar perfil comercial
        const profileBody: UpdateProviderProfileDTO = {
          businessName: formData.businessName,
          phone: formData.phone,
          whatsapp: formData.phone,
          brands: formData.brands.map((b) => b.id),
          mainCategories: formData.mainCategories.map((c) => c.id),
          paymentMethods: formData.paymentMethods,
          warrantyPolicy: formData.warrantyPolicy,
          returnPolicy: formData.returnPolicy,
          hasStorePickup: formData.hasStorePickup,
          hasLocalDelivery: formData.hasLocalDelivery,
          hasNationalDelivery: formData.hasNationalDelivery,
          shippingCarriers: formData.shippingCarriers,
          termsAccepted: true,
        };
        await updateProviderProfile(jwt, profileBody);

        // C. Subir documentos
        for (const type in selectedFiles) {
          const file = selectedFiles[type];
          if (file) await uploadProviderDocument(jwt, type, file);
        }

        // Limpieza y redirección
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LOCATION_STORAGE_KEY);
        toast.success("¡Registro completado con éxito!");
        router.replace("/profile/vendor");
      } catch (error) {
        toast.error("Error al finalizar el registro");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const getStepTitle = () => {
    const titles: Record<number, string> = {
      1: "Información Personal",
      2: "Información Comercial",
      3: "Documentación Legal",
      4: "Sede Principal",
      5: "Términos comerciales",
    };
    return titles[currentStep];
  };

  useEffect(() => {
    if (profile?.status === "active" || profile?.status === "reviewing") {
      router.replace("/profile/vendor");
      toast.error("Tu perfil ya está en proceso de revisión.");
    }
  }, [profile, router]);

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div className={styles.mainContainer} ref={cardRef}>
        <Header
          onBack={currentStep > 1 ? () => paginate(currentStep - 1) : undefined}
          title={getStepTitle()}
        />
        <div className={styles.content}>
          <div className={styles.stepperContainer}>
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className={styles.stepWrapper}>
                <div
                  className={`${styles.stepNumber} ${
                    currentStep >= step ? styles.stepActive : ""
                  }`}
                >
                  {step}
                </div>
                {step < 5 && (
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
                  setFormData={setFormData}
                  handleChange={handleChange}
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
                  jwt={jwt || ""}
                />
              )}
              {currentStep === 4 && (
                <StepLocationProvider
                  jwt={jwt || ""}
                  locationData={locationData}
                  setLocationData={handleSetLocation}
                  onSuccess={() => paginate(5)}
                />
              )}
              {currentStep === 5 && (
                <StepCommercialTerms
                  formData={formData}
                  setFormData={setFormData}
                  handleChange={handleChange}
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
                ? "Cargando..."
                : currentStep === 5
                ? "Finalizar Registro"
                : "Siguiente paso"}
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
