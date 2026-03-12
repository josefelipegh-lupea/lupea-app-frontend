"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { ProviderFormData } from "@/components/provider-onboarding/types";
import {
  updateSalesConditions,
  UpdateSalesConditionsDTO,
  SalesConditionsData,
} from "@/app/lib/api/vendor/vendorProfile";
import toast from "react-hot-toast";
import stylesBasics from "../basics/Basics.module.css";
import SkeletonProfile from "@/components/skeleton/SkeletonProfile";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";
import StepCommercialTerms from "@/components/provider-onboarding/steps/StepCommercialTerms";

export default function SalesConditionsEditPage() {
  const { profile, jwt, isLoading, refreshProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Cast seguro basado en la interfaz SalesConditionsData
  const vendor = profile as unknown as SalesConditionsData;

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
    // Solo cargamos si tenemos los datos necesarios
    if (vendor && vendor.documentId) {
      setFormData((prev) => ({
        ...prev,
        paymentMethods: vendor.paymentMethods || [],
        warrantyPolicy: vendor.warrantyPolicy || "Sin garantía",
        returnPolicy: vendor.returnPolicy || "",
      }));
    }
  }, [vendor]);

  const updateFormData = (newData: Partial<ProviderFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleSetFormData: React.Dispatch<
    React.SetStateAction<ProviderFormData>
  > = (value) => {
    setFormData((prev) => (typeof value === "function" ? value(prev) : value));
  };

  const handleSave = async () => {
    if (!jwt) return;

    if (formData.paymentMethods.length === 0) {
      return toast.error("Selecciona al menos un método de pago");
    }

    setIsSaving(true);

    const payload: UpdateSalesConditionsDTO = {
      paymentMethods: formData.paymentMethods,
      warrantyPolicy: formData.warrantyPolicy || "",
      returnPolicy: formData.returnPolicy || "",
    };

    try {
      const response = await updateSalesConditions(jwt, payload);

      toast.success(response.message || "Condiciones de venta actualizadas");

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
        <Header onBack={() => router.back()} title="Condiciones de Venta" />

        <div className={stylesBasics.content}>
          <StepCommercialTerms
            formData={formData}
            updateFormData={updateFormData}
            setFormData={handleSetFormData}
            handleChange={handleChange}
            mode="sales"
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
