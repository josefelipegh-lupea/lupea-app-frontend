"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "../ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { StepProps } from "@/components/provider-onboarding/types";
import { Category, getCategories } from "@/app/lib/api/getCategories";
import toast from "react-hot-toast";
import { getBrands, VehicleItem } from "@/app/lib/api/client/vehicle";
import { useAuth } from "@/context/AuthContext";
import {
  BaseEntity,
  ClassificationData,
} from "@/app/lib/api/vendor/vendorProfile";

interface SelectedSub {
  id: number;
  documentId: string;
  name: string;
  parentName: string;
}

interface BrandWithId extends VehicleItem {
  id: number;
}

interface StrapiResponse<T> {
  data: T[];
}

type EntityArrayKeys = "mainCategories" | "brands" | "subcategories";

const StepClassification: React.FC<StepProps> = ({ formData, setFormData }) => {
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [dbBrands, setDbBrands] = useState<VehicleItem[]>([]);
  const [lastSelectedCatId, setLastSelectedCatId] = useState<string | null>(
    null
  );

  // NUEVO: Estado para evitar re-hidratación al borrar todo
  const [isHydrated, setIsHydrated] = useState(false);

  const { jwt, profile } = useAuth();
  const vendor = profile as unknown as ClassificationData;

  const currentSubcategories = useMemo(() => {
    if (!lastSelectedCatId) return [];
    const selectedCat = dbCategories.find(
      (c) => c.documentId === lastSelectedCatId
    );
    return selectedCat?.children || [];
  }, [lastSelectedCatId, dbCategories]);

  useEffect(() => {
    if (!jwt) return;
    const fetchData = async () => {
      try {
        const [resCats, resBrands] = await Promise.all([
          getCategories(),
          getBrands(jwt),
        ]);
        const catsData = Array.isArray(resCats)
          ? resCats
          : (resCats as StrapiResponse<Category>).data || [];
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

  // EFECTO DE HIDRATACIÓN CORREGIDO
  useEffect(() => {
    if (dbCategories.length > 0 && vendor && !isHydrated) {
      // Solo hidratamos si el formData global está realmente vacío al montar
      const hasNoData =
        formData.mainCategories.length === 0 &&
        formData.subcategories.length === 0;

      if (hasNoData) {
        setFormData((prev) => ({
          ...prev,
          mainCategories: vendor.mainCategories || [],
          brands: vendor.brands || [],
          subcategories: (vendor.subcategories || []).map((sub) => {
            const parent = dbCategories.find((c) =>
              c.children?.some((child) => child.documentId === sub.documentId)
            );
            return {
              id: sub.id,
              documentId: sub.documentId,
              name: sub.name,
              parentName: parent?.name || "Repuesto",
            } as SelectedSub;
          }),
        }));
      }

      const timeout = setTimeout(() => {
        setIsHydrated(true);
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [dbCategories, vendor, isHydrated, setFormData]);

  const handleSelectChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
    type: "mainCategories" | "brands" | "subcategories"
  ) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    setFormData((prev) => {
      if (type === "mainCategories") {
        const item = dbCategories.find((c) => c.id === Number(selectedValue));
        if (item) {
          setLastSelectedCatId(item.documentId);
          if (
            !prev.mainCategories.some((c) => c.documentId === item.documentId)
          ) {
            return {
              ...prev,
              mainCategories: [
                ...prev.mainCategories,
                { id: item.id, name: item.name, documentId: item.documentId },
              ],
            };
          }
        }
      }

      if (type === "subcategories") {
        const item = currentSubcategories.find(
          (s) => s.id === Number(selectedValue)
        );
        const parent = dbCategories.find(
          (c) => c.documentId === lastSelectedCatId
        );
        if (
          item &&
          parent &&
          !prev.subcategories.some((s) => s.documentId === item.documentId)
        ) {
          return {
            ...prev,
            subcategories: [
              ...prev.subcategories,
              {
                id: item.id,
                documentId: item.documentId,
                name: item.name,
                parentName: parent.name,
              },
            ],
          };
        }
      }

      if (type === "brands") {
        const item = dbBrands.find((b) => b.documentId === selectedValue);
        if (item) {
          const numericId = (item as unknown as BrandWithId).id || 0;
          if (!prev.brands.some((b) => b.documentId === selectedValue)) {
            return {
              ...prev,
              brands: [
                ...prev.brands,
                { id: numericId, name: item.name, documentId: item.documentId },
              ],
            };
          }
        }
      }
      return prev;
    });
    e.target.value = "";
  };

  const removeItem = (type: EntityArrayKeys, documentId: string) => {
    if (type === "mainCategories") {
      if (lastSelectedCatId === documentId) setLastSelectedCatId(null);
      const categoryToRemove = dbCategories.find(
        (c) => c.documentId === documentId
      );
      const subcategoryIdsToRemove =
        categoryToRemove?.children?.map((sub) => sub.documentId) || [];

      setFormData((prev) => ({
        ...prev,
        mainCategories: prev.mainCategories.filter(
          (item) => item.documentId !== documentId
        ),
        subcategories: prev.subcategories.filter(
          (sub) => !subcategoryIdsToRemove.includes(sub.documentId)
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [type]: (prev[type] as BaseEntity[]).filter(
          (item) => item.documentId !== documentId
        ),
      }));
    }
  };

  return (
    <div className={styles.gridContainer}>
      {/* CATEGORÍAS */}
      <div className={styles.fullWidth}>
        <label className={styles.label}>
          Categorías en la que clasifica tu negocio
        </label>
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
            {dbCategories
              .filter(
                (cat) =>
                  !formData.mainCategories.some(
                    (s) => s.documentId === cat.documentId
                  )
              )
              .map((cat) => (
                <option key={cat.documentId} value={cat.id}>
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
            <p className={styles.emptyStateText}>Categorías vacías</p>
          ) : (
            formData.mainCategories.map((cat) => (
              <button
                key={cat.documentId}
                type="button"
                onClick={() => {
                  // IMPORTANTE: Primero removemos, luego la lógica de Step decide si limpia lastSelectedCatId
                  removeItem("mainCategories", cat.documentId);
                }}
                className={`${styles.categoryPill} ${styles.activePill}`}
                style={
                  lastSelectedCatId === cat.documentId
                    ? { outline: "2px solid #ff9100" }
                    : {}
                }
              >
                {cat.name} <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* SUBCATEGORÍAS */}
      <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
        <label className={styles.label}>Subcategorías</label>
        <div className={styles.inputWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <select
            className={`${styles.input} ${styles.selects}`}
            onChange={(e) => handleSelectChange(e, "subcategories")}
            value=""
            disabled={!lastSelectedCatId || currentSubcategories.length === 0}
          >
            <option value="" disabled>
              {!lastSelectedCatId
                ? "Selecciona categoría arriba"
                : currentSubcategories.length === 0
                ? "No hay subcategorías"
                : "Selecciona productos"}
            </option>
            {currentSubcategories
              .filter(
                (sub) =>
                  !formData.subcategories.some(
                    (s) => s.documentId === sub.documentId
                  )
              )
              .map((sub) => (
                <option key={sub.documentId} value={sub.id}>
                  {sub.name}
                </option>
              ))}
          </select>
          <div className={styles.iconOverlay}>
            <IconsApp.DownArrow />
          </div>
        </div>
        <div className={styles.tagsScrollContainer}>
          {formData.subcategories.length === 0 ? (
            <p className={styles.emptyStateText}>
              Selecciona tus especialidades
            </p>
          ) : (
            (formData.subcategories as SelectedSub[]).map((sub) => (
              <button
                key={sub.documentId}
                type="button"
                onClick={() => removeItem("subcategories", sub.documentId)}
                className={`${styles.categoryPill} ${styles.activePill}`}
                style={{
                  height: "auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  padding: "6px 12px",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    textTransform: "uppercase",
                    fontWeight: "bold",
                    opacity: 0.8,
                    lineHeight: "1",
                  }}
                >
                  {sub.parentName ||
                    dbCategories.find((c) =>
                      c.children?.some(
                        (child) => child.documentId === sub.documentId
                      )
                    )?.name ||
                    "Repuesto"}
                </span>
                <span style={{ fontSize: "13px" }}>
                  {sub.name} <span className={styles.removeIcon}>×</span>
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MARCAS */}
      <div className={styles.fullWidth} style={{ marginTop: "20px" }}>
        <label className={styles.label}>Marcas que manejas</label>
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
              Selecciona marcas
            </option>
            {dbBrands
              .filter(
                (brand) =>
                  !formData.brands.some(
                    (s) => s.documentId === brand.documentId
                  )
              )
              .map((brand) => (
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
            <p className={styles.emptyStateText}>Añade marcas de vehículos</p>
          ) : (
            formData.brands.map((brand) => (
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
