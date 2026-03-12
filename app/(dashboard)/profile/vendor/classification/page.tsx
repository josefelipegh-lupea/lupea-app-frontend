"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import StepClassification from "@/components/provider-onboarding/steps/StepClassification";
import { ProviderFormData } from "@/components/provider-onboarding/types";
import {
  updateClassificationData,
  UpdateClassificationDTO,
  ClassificationData,
} from "@/app/lib/api/vendor/vendorProfile";
import toast from "react-hot-toast";
import stylesBasics from "../basics/Basics.module.css";
import SkeletonProfile from "@/components/skeleton/SkeletonProfile";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";

export default function ClassificationEditPage() {
  const { profile, jwt, isLoading, refreshProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const vendor = profile as unknown as ClassificationData;

  const [formData, setFormData] = useState<ProviderFormData>({
    username: "",
    email: "",
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

  useEffect(() => {
    if (vendor && vendor.documentId) {
      setFormData((prev) => ({
        ...prev,
        mainCategories: vendor.mainCategories || [],
        subcategories: vendor.subcategories || [],
        brands: vendor.brands || [],
      }));
    }
  }, [vendor]);

  const updateFormData = (newData: Partial<ProviderFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleSetFormData: React.Dispatch<
    React.SetStateAction<ProviderFormData>
  > = (value) => {
    setFormData((prev) => (typeof value === "function" ? value(prev) : value));
  };

  const handleSave = async () => {
    if (!jwt) return;

    if (formData.mainCategories.length === 0) {
      return toast.error("Debes seleccionar al menos una categoría");
    }
    if (formData.subcategories.length === 0) {
      return toast.error("Debes seleccionar al menos una subcategoría");
    }
    if (formData.brands.length === 0) {
      return toast.error("Debes seleccionar al menos una marca");
    }

    setIsSaving(true);

    const payload: UpdateClassificationDTO = {
      mainCategories: formData.mainCategories.map((c) => c.id),
      subcategories: formData.subcategories.map((s) => s.id),
      brands: formData.brands.map((b) => b.id),
    };

    try {
      await updateClassificationData(jwt, payload);
      toast.success("Información comercial actualizada correctamente");

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      toast.error("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) return <SkeletonProfile />;

  return (
    <div
      className={`${stylesBasics.pageWrapper} ${
        !isExpanded ? stylesBasics.sidebarCollapsed : ""
      }`}
    >
      <main className={stylesBasics.mainContainer}>
        <Header onBack={() => router.back()} title="Información Comercial" />

        <div className={stylesBasics.content}>
          <StepClassification
            formData={formData}
            updateFormData={updateFormData}
            setFormData={handleSetFormData}
            handleChange={() => {}}
          />
          <div className={stylesBasics.footer}>
            <Button
              className={stylesBasics.saveBtn}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
