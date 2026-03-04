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
import SparePartsStep, { SparePart } from "@/components/request/SparePartsStep";
import DeliveryStep from "@/components/request/DeliveryStep";
import { IconsApp } from "@/components/icons/Icons";
import ExtraInfoStep from "@/components/request/ExtraInfoStep";
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
} from "@/app/lib/api/client/location";

export interface FormData {
  userVehicle?: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  version: string;
  category: string;
  partName: string;
  oemCode: string;
  quantity: number;
  condition: string;
  spareParts: SparePart[];
  deliveryCity: string;
  deliveryMethod: string;
  extraInfo: string;
  photo: File | null;
  photoUrl?: string;
  photoId?: number;
}

export default function RequestPage() {
  const router = useRouter();
  const { jwt } = useAuth();

  const [savedLocations, setSavedLocations] = useState<Location[]>([]);
  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleItem[]>([]);
  const [engines, setEngines] = useState<VehicleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [states, setStates] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const { isExpanded } = useSidebar();
  const contentRef = useRef<HTMLDivElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    brand: "",
    model: "",
    year: 0,
    engine: "",
    version: "",
    category: "",
    partName: "",
    oemCode: "",
    quantity: 1,
    condition: "no_importa",

    spareParts: [],

    deliveryCity: "3",
    deliveryMethod: "retiro",
    extraInfo: "",
    photo: null,
  });

  const refreshVehicles = async () => {
    if (!jwt) {
      return;
    }

    const res = await getClientVehicles(jwt);
    if (res.data) {
      setUserVehicles(res.data);
      return res.data;
    }
  };

  const handleSubmit = async () => {
    // if (!isFormValid()) {
    //   toast.error("Por favor, completa todos los campos obligatorios.");
    //   return;
    // }

    setIsSubmitting(true);

    if (!formData.userVehicle) return toast.error("Selecciona un vehículo");
    if (formData.spareParts.length === 0)
      return toast.error("Agrega al menos un repuesto");
    if (!jwt) return;

    setIsSubmitting(true);
    try {
      const itemsPayload = formData.spareParts.map((part) => {
        let foundCategoryId: number | undefined;

        categories.forEach((cat) => {
          const sub = cat.children?.find((s) => s.name === part.partName);
          if (sub) foundCategoryId = sub.id;
        });

        return {
          categoryId: foundCategoryId || 0,
          productName: part.partName,
          quantity: part.quantity,
          oemCode: part.oemCode,
          conditionPreferred: part.condition,
          description: formData.extraInfo,
          imageId: formData.photoId,
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
        toast.success("¡Solicitud enviada con éxito!");
        router.push("/home/user");
      }
    } catch (error: unknown) {
      if (error instanceof Error)
        toast.error(error.message || "Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isVehicleReady = !!formData.userVehicle;
  const isSparePartsReady = formData.spareParts.length > 0;
  const isDeliveryReady = !!formData.deliveryCity;

  const isFormValid = isVehicleReady && isSparePartsReady && isDeliveryReady;

  useEffect(() => {
    const initLoad = async () => {
      if (!jwt) return;
      try {
        setLoading(true);
        const [vRes, bRes, eRes, cRes, lRes] = await Promise.all([
          getClientVehicles(jwt),
          getBrands(jwt),
          getEngineTypes(jwt),
          getCategories(),
          getClientLocations(jwt),
        ]);
        setUserVehicles(vRes.data || []);
        setBrands(bRes.data || []);
        setEngines(eRes.data || []);
        setCategories(cRes.data || []);
        setSavedLocations(lRes.data || []);
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
      <div className={styles.mainContainer}>
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
          />

          <SparePartsStep
            formData={formData}
            setFormData={setFormData}
            contentRef={contentRef}
            categories={categories}
            isCompleted={isSparePartsReady}
          />
          <DeliveryStep
            formData={formData}
            setFormData={setFormData}
            states={states}
            isCompleted={isDeliveryReady}
            locations={savedLocations}
          />
          <ExtraInfoStep
            jwt={jwt!}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
        <footer
          className={styles.footer}
          onPointerMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.preventDefault()}
        >
          <Button
            className={styles.saveButton}
            onClick={handleSubmit}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? (
              "Enviando..."
            ) : (
              <>
                <IconsApp.Search /> Nueva solicitud
              </>
            )}
          </Button>
          <button className={styles.saveDraft}>Guardar borrador</button>
        </footer>
      </div>
    </div>
  );
}
