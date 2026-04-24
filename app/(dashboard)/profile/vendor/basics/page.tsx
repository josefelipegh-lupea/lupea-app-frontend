"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import StepBasics from "@/components/provider-onboarding/steps/StepBasics";
import { ProviderFormData } from "@/components/provider-onboarding/types";
import {
  ProviderProfileData,
  updateCommercialData,
  UpdateCommercialDataDTO,
} from "@/app/lib/api/vendor/vendorProfile";
import { useBasicsValidation } from "@/hooks/useBasicsValidation";
import toast from "react-hot-toast";
import styles from "./Basics.module.css";
import SkeletonProfile from "@/components/skeleton/SkeletonProfile";
import Header from "@/components/header/Header";
import { useRouter } from "next/navigation";
import Button from "@/components/button/Button";

export default function BasicsEditPage() {
  const { profile, user, jwt, isLoading, refreshProfile } = useAuth();
  const { isExpanded } = useSidebar();
  const [isSaving, setIsSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const vendor = profile as unknown as ProviderProfileData;

  const [formData, setFormData] = useState<ProviderFormData>({
    username: user?.username || "",
    email: user?.email || "",
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
  useEffect(() => {
    if (vendor) {
      setFormData((prev) => ({
        ...prev,
        username: user?.username || prev.username,
        email: user?.email || prev.email,
        businessName: vendor.businessName || "",
        phoneNumber: vendor.phoneNumber || "",
      }));
    }
  }, [vendor, user]);

  const updateFormData = (newData: Partial<ProviderFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "phoneNumber") {
      const digits = value.replace(/\D/g, "");

      if (!value.startsWith("+58")) {
        const onlySuffix = digits.startsWith("58") ? digits.slice(2) : digits;
        newValue = "+58" + onlySuffix;
      } else {
        newValue = "+58" + value.substring(3).replace(/\D/g, "");
      }

      if (newValue.length > 14) return;
    }

    updateFormData({ [name]: newValue });
  };

  const handleSetFormData: React.Dispatch<
    React.SetStateAction<ProviderFormData>
  > = (value) => {
    setFormData((prev) => (typeof value === "function" ? value(prev) : value));
  };

  const handleSave = async () => {
    setSubmitted(true);
    if (!basics.isValid || !jwt) return;
    setIsSaving(true);

    const payload: UpdateCommercialDataDTO = {
      businessName: formData.businessName,
      phoneNumber: formData.phoneNumber,
    };

    try {
      await updateCommercialData(jwt, payload);
      toast.success("Datos comerciales actualizados");

      if (refreshProfile) {
        await refreshProfile();
      }
    } catch (error) {
      toast.error("Error al guardar los cambios");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main className={styles.mainContainer}>
          <Header onBack={() => router.back()} title="Datos Comerciales" />
          <div className={styles.content}>
            <SkeletonProfile />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <main className={styles.mainContainer}>
        <Header onBack={() => router.back()} title="Datos Comerciales" />

        <div className={styles.content}>
          <StepBasics
            formData={formData}
            updateFormData={updateFormData}
            setFormData={handleSetFormData}
            handleChange={handleChange}
            errors={submitted ? Object.fromEntries(
              Object.entries(basics.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
            ) : undefined}
          />

          <div className={styles.footer}>
            <Button
              className={styles.saveBtn}
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
