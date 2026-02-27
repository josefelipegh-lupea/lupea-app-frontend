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
}

export default function RequestPage() {
  const { jwt } = useAuth();

  const [userVehicles, setUserVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<VehicleItem[]>([]);
  const [engines, setEngines] = useState<VehicleItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { isExpanded } = useSidebar();
  const contentRef = useRef<HTMLDivElement>(null);

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

    deliveryCity: "",
    deliveryMethod: "",
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

  useEffect(() => {
    const initLoad = async () => {
      if (!jwt) return;
      try {
        const [vRes, bRes, eRes, cRes] = await Promise.all([
          getClientVehicles(jwt),
          getBrands(jwt),
          getEngineTypes(jwt),
          getCategories(),
        ]);
        setUserVehicles(vRes.data || []);
        setBrands(bRes.data || []);
        setEngines(eRes.data || []);
        setCategories(cRes.data || []);
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
          />

          {/* SIGUIENTES CARDS VENDRÁN AQUÍ COMO COMPONENTES */}
          <SparePartsStep
            formData={formData}
            setFormData={setFormData}
            contentRef={contentRef}
            categories={categories}
          />
          <DeliveryStep formData={formData} setFormData={setFormData} />
          <ExtraInfoStep formData={formData} setFormData={setFormData} />
        </div>
        <footer
          className={styles.footer}
          onPointerMove={(e) => e.stopPropagation()}
          onWheel={(e) => e.preventDefault()}
        >
          <Button className={styles.saveButton}>
            <IconsApp.Search />
            Nueva solicitud
          </Button>
          <button className={styles.saveDraft}>Guardar borrador</button>
        </footer>
      </div>
    </div>
  );
}
