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
import { useLocationValidation } from "@/hooks/useLocation";
import SkeletonProfile from "../skeleton/SkeletonProfile";
import { IconsApp } from "../icons/Icons";

const STORAGE_KEY = "provider_onboarding_data";
const LOCATION_STORAGE_KEY = "provider_onboarding_location";

const ProviderOnboarding: React.FC = () => {
  const { profile, jwt, isLoading, refreshProfile } = useAuth();
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
    phoneNumber: "",
    mainCategories: [],
    subcategories: [],
    brands: [],
    businessPhotos: [],
    paymentMethods: [],
    warrantyPolicy: "Sin garantía",
    returnPolicy: "",
    hasStorePickup: false,
    hasLocalDelivery: false,
    hasNationalDelivery: false,
    nationalCarriers: [],
  });

  const basics = useBasicsValidation(formData);
  const classification = useClassificationValidation(formData);
  const documents = useDocumentsValidation(selectedFiles);
  const location = useLocationValidation(locationData);
  const comercial = useCommercialValidation(formData);

  // 1. Cargar datos persistidos al iniciar
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);

    // Importante: Mezclamos lo guardado con los datos de sesión por si acaso
    if (savedData) {
      setFormData((prev) => ({
        ...prev,
        ...JSON.parse(savedData),
        username: profile?.username || prev.username,
        email: profile?.email || prev.email,
      }));
    }
    if (savedLocation) setLocationData(JSON.parse(savedLocation));
  }, [profile]);

  const updateFormData = (newData: Partial<ProviderFormData>) => {
    setFormData((prev) => {
      const updated = { ...prev, ...newData };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

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
    if (currentStep === 4) return location.isValid;
    if (currentStep === 5) return comercial.isValid;
    return false;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phoneNumber") {
      const cleanNumbers = value.replace(/\D/g, "");
      newValue = value.startsWith("+58")
        ? "+58" + value.substring(3).replace(/\D/g, "")
        : "+58" + cleanNumbers;
      if (newValue.length > 14) return;
    }

    updateFormData({ [name]: newValue });
  };

  const handleSetFormData: React.Dispatch<
    React.SetStateAction<ProviderFormData>
  > = (value) => {
    setFormData((prev) => {
      const nextState = typeof value === "function" ? value(prev) : value;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      return nextState;
    });
  };

  const handleNextStep = async () => {
    if (currentStep < 5) {
      paginate(currentStep + 1);
    } else {
      if (!jwt || !locationData) return;
      setIsSaving(true);
      try {
        for (const type in selectedFiles) {
          const file = selectedFiles[type];
          if (file) await uploadProviderDocument(jwt, type, file);
        }

        const profileBody: UpdateProviderProfileDTO = {
          ...formData,
          phoneNumber: formData.phoneNumber,
          brands: formData.brands.map((b) => b.id),
          mainCategories: formData.mainCategories.map((c) => c.id),
          subcategories: formData.subcategories.map((s) => s.id),
          termsAccepted: true,
          location: {
            name: locationData.name,
            type: "branch",
            state: locationData.state,
            municipality: locationData.municipality,
            parish: locationData.parish,
            address: locationData.address,
            exactAddress: locationData.exactAddress,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            placeId: locationData.placeId,
          },
        };
        await updateProviderProfile(jwt, profileBody);

        // Limpieza y redirección
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LOCATION_STORAGE_KEY);
        await refreshProfile();
        toast.success("¡Registro completado con éxito!", { duration: 5000 });
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
    if (
      !isLoading &&
      (profile?.status === "active" || profile?.status === "in_review")
    ) {
      toast("Tu perfil ya está en proceso de revisión.", {
        icon: <IconsApp.Warning />,
        duration: 5000,
      });
      router.replace("/profile/vendor");
    }
  }, [profile, isLoading, router]);

  if (
    isLoading ||
    profile?.status === "active" ||
    profile?.status === "in_review"
  ) {
    return <SkeletonProfile />;
  }

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
                  updateFormData={updateFormData}
                  setFormData={handleSetFormData}
                  handleChange={handleChange}
                />
              )}
              {currentStep === 2 && (
                <StepClassification
                  formData={formData}
                  updateFormData={updateFormData}
                  setFormData={handleSetFormData}
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
                  updateFormData={updateFormData}
                  setFormData={handleSetFormData}
                  handleChange={handleChange}
                  mode="all"
                />
              )}
            </StepTransition>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              className={`${styles.btnSubmit} ${
                !isCurrentStepValid() || isSaving
                  ? styles.btnDisabled
                  : styles.btnActive
              }`}
              onClick={handleNextStep}
              disabled={!isCurrentStepValid() || isSaving}
            >
              {isSaving
                ? "Enviando..."
                : currentStep === 5
                ? "Finalizar Registro"
                : "Siguiente"}
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
