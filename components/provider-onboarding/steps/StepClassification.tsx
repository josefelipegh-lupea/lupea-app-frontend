"use client";

import React, { useEffect, useState } from "react";
import styles from "../ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { StepProps } from "@/components/provider-onboarding/types";
import { Category, getCategories } from "@/app/lib/api/getCategories";
import toast from "react-hot-toast";
import { getBrands, VehicleItem } from "@/app/lib/api/client/vehicle";
import { useAuth } from "@/context/AuthContext";
import { BaseEntity } from "@/app/lib/api/vendor/vendorProfile";

interface VehicleItemWithId extends VehicleItem {
  id: number;
}

interface StrapiResponse<T> {
  data: T[];
}

const StepClassification: React.FC<StepProps> = ({ formData, setFormData }) => {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<VehicleItem[]>([]);
  const { jwt } = useAuth();

  useEffect(() => {
    if (!jwt) return;
    const fetchData = async () => {
      try {
        const [resCats, resBrands] = await Promise.all([
          getCategories(),
          getBrands(jwt),
        ]);

        // Manejo de tipado para categorías
        const catsData = Array.isArray(resCats)
          ? resCats
          : (resCats as StrapiResponse<Category>).data || [];

        // Manejo de tipado para marcas
        const brandsData = Array.isArray(resBrands)
          ? resBrands
          : (resBrands as StrapiResponse<VehicleItem>).data || [];

        setDbCategories(catsData);
        setDbBrands(brandsData);
      } catch (error) {
        toast.error("Error al cargar los catálogos");
      }
    };
    fetchData();
  }, [jwt]);

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "mainCategories" | "brands"
  ) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    if (type === "mainCategories") {
      const id = Number(selectedValue);
      const item = dbCategories.find((c) => c.id === id);
      if (item && !formData.mainCategories.some((c) => c.id === id)) {
        setFormData((prev) => ({
          ...prev,
          mainCategories: [
            ...prev.mainCategories,
            {
              id: item.id,
              name: item.name,
              documentId: item.documentId,
            },
          ],
        }));
      }
    } else {
      // Para marcas buscamos por documentId ya que VehicleItem no tiene id numérico en su interfaz
      const item = dbBrands.find((b) => b.documentId === selectedValue);
      if (item) {
        // Si Strapi envía el id aunque no esté en la interfaz, lo capturamos con cuidado
        const numericId = "id" in item ? (item as VehicleItemWithId).id : 0;

        if (!formData.brands.some((b) => b.documentId === selectedValue)) {
          setFormData((prev) => ({
            ...prev,
            brands: [
              ...prev.brands,
              {
                id: numericId,
                name: item.name,
                documentId: item.documentId,
              },
            ],
          }));
        }
      }
    }

    e.target.value = ""; // Limpiar el select
  };

  const removeItem = (
    type: "mainCategories" | "brands",
    documentId: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter(
        (item: BaseEntity) => item.documentId !== documentId
      ),
    }));
  };

  return (
    <div className={styles.gridContainer}>
      {/* SECCIÓN CATEGORÍAS */}
      <div className={styles.fullWidth}>
        <label className={styles.label}>¿Qué repuestos vendes?</label>
        <div className={styles.inputWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <select
            className={`${styles.input} ${styles.selects}`}
            onChange={(e) => handleSelectChange(e, "mainCategories")}
            value=""
          >
            <option value="" disabled>
              Selecciona categorías
            </option>
            {dbCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className={styles.iconOverlay}>
            <IconsApp.DownArrow />
          </div>
        </div>

        <div className={styles.tagsScrollContainer}>
          {formData.mainCategories.length === 0 ? (
            <p className={styles.emptyStateText}>
              Aquí aparecerán las categorías
            </p>
          ) : (
            formData.mainCategories.map((cat: BaseEntity) => (
              <button
                key={cat.documentId}
                type="button"
                onClick={() => removeItem("mainCategories", cat.documentId)}
                className={`${styles.categoryPill} ${styles.activePill}`}
              >
                {cat.name} <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* SECCIÓN MARCAS */}
      <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
        <label className={styles.label}>¿Qué marcas manejas?</label>
        <div className={styles.inputWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <select
            className={`${styles.input} ${styles.selects}`}
            onChange={(e) => handleSelectChange(e, "brands")}
            value=""
          >
            <option value="" disabled>
              Selecciona las marcas
            </option>
            {dbBrands.map((brand) => (
              <option key={brand.documentId} value={brand.documentId}>
                {brand.name}
              </option>
            ))}
          </select>
          <div className={styles.iconOverlay}>
            <IconsApp.DownArrow />
          </div>
        </div>

        <div className={styles.tagsScrollContainer}>
          {formData.brands.length === 0 ? (
            <p className={styles.emptyStateText}>Aquí aparecerán las marcas</p>
          ) : (
            formData.brands.map((brand: BaseEntity) => (
              <button
                key={brand.documentId}
                type="button"
                onClick={() => removeItem("brands", brand.documentId)}
                className={`${styles.categoryPill} ${styles.activePill}`}
              >
                {brand.name} <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StepClassification;
