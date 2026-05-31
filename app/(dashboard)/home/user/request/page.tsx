"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Request.module.css";
import Header from "@/components/header/Header";
import { useAuth } from "@/context/AuthContext";
import {
  getBrands,
  getClientVehicles,
  getEngineTypes,
  Vehicle,
  VehicleItem,
} from "@/app/lib/api/client/vehicle";
import VehicleStep from "@/components/request/VehicleStep";
import SparePartsStep from "@/components/request/SparePartsStep";
import DeliveryStep from "@/components/request/DeliveryStep";
import { IconsApp } from "@/components/icons/Icons";
import Button from "@/components/button/Button";
import { useSidebar } from "@/context/SidebarContext";
import { Category, getCategories } from "@/app/lib/api/getCategories";
import { useRouter } from "next/navigation";
import {
  createQuoteRequest,
  CreateQuoteRequestPayload,
} from "@/app/lib/api/request/request";
import toast from "react-hot-toast";
import {
  getClientLocations,
  getStates,
  Location,
  State,
} from "@/app/lib/api/client/location";
import { useRequestForm } from "@/hooks/useRequesFormAutoSave";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";

export default function RequestPage() {
  const router = useRouter();
  const { jwt, refreshProfile, refreshLoginProfile } = useAuth();

  const [allStates, setAllStates] = useState<State[]>([]);
  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleItem[]>([]);
  const [engines, setEngines] = useState<VehicleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isExpanded } = useSidebar();
  const { isFooterVisible } = useFooterVisibility();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const vehicleRef = useRef<HTMLElement>(null);
  const sparePartsRef = useRef<HTMLElement>(null);
  const deliveryRef = useRef<HTMLElement>(null);

  const { formData, setFormData, isValid, saveDraft, clearDraft } =
    useRequestForm({
      brand: "",
      model: "",
      year: 0,
      engine: "",
      version: "",
      spareParts: [],
      deliveryCity: "",
      deliveryMethod: "retiro",
      extraInfo: "",
      photo: null,
    });

  const refreshVehicles = async () => {
    if (!jwt) return;
    const res = await getClientVehicles(jwt);
    if (res.data) {
      setUserVehicles(res.data);
      return res.data;
    }
    return [];
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    if (!isVehicleReady) {
      vehicleRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!isSparePartsReady) {
      sparePartsRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (!isDeliveryReady) {
      deliveryRef.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    if (!jwt) return;

    setIsSubmitting(true);

    try {
      const itemsPayload = formData.spareParts.map((part) => {
        let foundCategoryId: number | undefined;
        const parentCategory = categories.find((cat) => cat.name === part.category);
        const subcategory = parentCategory?.children?.find(
          (sub) => sub.name === part.subcategory,
        );

        if (subcategory) {
          foundCategoryId = subcategory.id;
        }

        return {
          categoryId: foundCategoryId || 0,
          productName: part.partName,
          quantity: part.quantity,
          conditionPreferred: part.condition,
          preferredBrand: part.condition === "original" ? "Original" : "",
          description: part.description || "",
          imageId: part.photoId,
        };
      });

      const payload: CreateQuoteRequestPayload = {
        vehicleId: Number(formData.userVehicle),
        locationId: Number(formData.deliveryCity),
        deliveryPreference:
          formData.deliveryMethod === "retiro" ? "pickup" : "delivery",
        items: itemsPayload,
      };

      const res = await createQuoteRequest(jwt, payload);

      if (res.ok) {
        clearDraft();
        const refreshedProfile = await refreshProfile();
        if (refreshedProfile) {
          await refreshLoginProfile(refreshedProfile);
        }
        toast.success("¡Consulta enviada con éxito!");
        setTimeout(() => router.push("/home/user"), 1500);
      }
    } catch (error) {
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVehicleReady = !!formData.userVehicle;
  const isSparePartsReady = formData.spareParts.length > 0;
  const isDeliveryReady = !!formData.deliveryCity;
  const isFormValid = isVehicleReady && isSparePartsReady && isDeliveryReady;

  useEffect(() => {
    if (isVehicleReady || isSparePartsReady || isDeliveryReady) {
      saveDraft(formData);
    }
  }, [formData]);

  useEffect(() => {
    document.body.classList.add("request-page");
    return () => {
      document.body.classList.remove("request-page");
    };
  }, []);

  useEffect(() => {
    const initLoad = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        const [vRes, bRes, eRes, cRes, lRes, sRes] = await Promise.all([
          getClientVehicles(jwt),
          getBrands(jwt),
          getEngineTypes(jwt),
          getCategories(),
          getClientLocations(jwt),
          getStates(jwt),
        ]);
        setUserVehicles(vRes.data || []);
        setBrands(bRes.data || []);
        setEngines(eRes.data || []);
        setCategories(cRes.data || []);
        setSavedLocations(lRes.data || []);
        setAllStates(sRes.data || []);
      } finally {
        setLoading(false);
      }
    };
    initLoad();
  }, [jwt]);

  return (
    <div
      className={`${styles.pageWrapper} ${
        !isExpanded ? styles.sidebarCollapsed : ""
      }`}
    >
      <div
        className={`${styles.mainContainer} ${
          !isFooterVisible ? styles.noFooter : ""
        }`}
      >
        <Header title="Buscar repuesto" />

        <div className={styles.content} ref={contentRef}>
          <VehicleStep
            jwt={jwt!}
            userVehicles={userVehicles}
            brands={brands}
            engines={engines}
            formData={formData}
            setFormData={setFormData}
            loadingInitial={loading}
            contentRef={contentRef}
            refreshVehicles={refreshVehicles}
            isCompleted={isVehicleReady}
            saveDraft={saveDraft}
            showError={submitAttempted && !isVehicleReady}
            sectionRef={vehicleRef}
          />

          <SparePartsStep
            jwt={jwt!}
            formData={formData}
            setFormData={setFormData}
            contentRef={contentRef}
            categories={categories}
            isCompleted={isSparePartsReady}
            saveDraft={saveDraft}
            showError={submitAttempted && !isSparePartsReady}
            sectionRef={sparePartsRef}
          />

          <DeliveryStep
            formData={formData}
            setFormData={setFormData}
            states={allStates}
            isCompleted={isDeliveryReady}
            locations={savedLocations}
            saveDraft={saveDraft}
            showError={submitAttempted && !isDeliveryReady}
            sectionRef={deliveryRef}
          />
        </div>

        <footer className={styles.footer}>
          <Button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Enviar"}
          </Button>
          <div className={styles.statusIndicator}>
            {isValid ? (
              <span className={styles.autoSaveSuccess}>
                <IconsApp.Check /> Guardado automático
              </span>
            ) : (
              <span className={styles.autoSaveWarning}>
                <IconsApp.Warning /> Progreso guardado
              </span>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
