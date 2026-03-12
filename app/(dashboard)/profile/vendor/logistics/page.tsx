"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { ProviderFormData } from "@/components/provider-onboarding/types";
import {
  updateLogisticsData,
  UpdateLogisticsDTO,
  LogisticsData,
} from "@/app/lib/api/vendor/vendorProfile";
import toast from "react-hot-toast";
import stylesBasics from "../basics/Basics.module.css";
import SkeletonProfile from "@/components/skeleton/SkeletonProfile";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import StepCommercialTerms from "@/components/provider-onboarding/steps/StepCommercialTerms";

export default function LogisticsEditPage() {
  const { profile, jwt, isLoading, refreshProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const vendor = profile as unknown as LogisticsData;

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
        hasStorePickup: vendor.hasStorePickup ?? false,
        hasLocalDelivery: vendor.hasLocalDelivery ?? false,
        hasNationalDelivery: vendor.hasNationalDelivery ?? false,
        nationalCarriers: vendor.nationalCarriers || [],
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

    if (
      !formData.hasStorePickup &&
      !formData.hasLocalDelivery &&
      !formData.hasNationalDelivery
    ) {
      return toast.error("Debes seleccionar al menos un método de entrega");
    }

    setIsSaving(true);

    const payload: UpdateLogisticsDTO = {
      hasStorePickup: formData.hasStorePickup,
      hasLocalDelivery: formData.hasLocalDelivery,
      hasNationalDelivery: formData.hasNationalDelivery,
      nationalCarriers: formData.nationalCarriers,
    };

    try {
      const response = await updateLogisticsData(jwt, payload);

      toast.success(response.message || "Logística actualizada correctamente");

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      toast.error("Error al guardar los cambios de logística");
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
        <Header onBack={() => router.back()} title="Logística y Entrega" />

        <div className={stylesBasics.content}>
          <StepCommercialTerms
            formData={formData}
            updateFormData={updateFormData}
            setFormData={handleSetFormData}
            handleChange={() => {}}
            mode="logistics"
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
