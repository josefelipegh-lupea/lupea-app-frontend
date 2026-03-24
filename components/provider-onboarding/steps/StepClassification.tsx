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
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);

  // NUEVO: Estado para evitar re-hidratación al borrar todo
  const [isHydrated, setIsHydrated] = useState(false);

  const { jwt, profile } = useAuth();
  const vendor = profile as unknown as ClassificationData;

  const allSubcategoriesFromSelected = useMemo(() => {
    if (formData.mainCategories.length === 0) return [];
    return [...formData.mainCategories]
      .reverse()
      .map((selectedCat) => {
        const category = dbCategories.find(
          (c) => c.documentId === selectedCat.documentId
        );
        if (!category || !category.children) return null;
        return {
          categoryName: category.name,
          categoryDocId: category.documentId,
          subcategories: category.children as Category[],
        };
      })
      .filter(
        (
          item
        ): item is {
          categoryName: string;
          categoryDocId: string;
          subcategories: Category[];
        } => item !== null
      );
  }, [formData.mainCategories, dbCategories]);

  const filteredSubcategories = useMemo(() => {
    if (!subcategorySearch.trim()) return allSubcategoriesFromSelected;
    const searchLower = subcategorySearch.toLowerCase();
    return allSubcategoriesFromSelected
      .map((group) => ({
        ...group,
        subcategories: group.subcategories.filter((sub) =>
          sub.name.toLowerCase().includes(searchLower)
        ),
      }))
      .filter((group) => group.subcategories.length > 0);
  }, [allSubcategoriesFromSelected, subcategorySearch]);

  const flatFilteredSubcategories = useMemo(() => {
    return filteredSubcategories.flatMap((group) => group.subcategories);
  }, [filteredSubcategories]);

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
        const item = flatFilteredSubcategories.find(
          (s) => s.id === Number(selectedValue)
        );
        const parent = dbCategories.find((c) =>
          c.children?.some((child) => child.id === Number(selectedValue))
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

  const handleSubcategorySelect = (sub: Category, categoryName: string) => {
    setFormData((prev) => {
      if (prev.subcategories.some((s) => s.documentId === sub.documentId)) {
        return prev;
      }
      return {
        ...prev,
        subcategories: [
          ...prev.subcategories,
          {
            id: sub.id,
            documentId: sub.documentId,
            name: sub.name,
            parentName: categoryName,
          },
        ],
      };
    });
  };

  const removeItem = (type: EntityArrayKeys, documentId: string) => {
    if (type === "mainCategories") {
      if (formData.mainCategories.length <= 1) setLastSelectedCatId(null);
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
        <div className={styles.selectWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <select
            className={styles.input}
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
                  removeItem("mainCategories", cat.documentId);
                }}
                className={`${styles.categoryPill} ${styles.activePill} ${
                  lastSelectedCatId === cat.documentId
                    ? styles.categoryPillSelected
                    : ""
                }`}
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
        <div className={styles.subcategoryInputWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <input
            type="text"
            className={styles.input}
            placeholder={
              formData.mainCategories.length === 0
                ? "Selecciona categoría arriba"
                : "Buscar subcategorías..."
            }
            value={subcategorySearch}
            onChange={(e) => setSubcategorySearch(e.target.value)}
            onFocus={() => setSubcategoryDropdownOpen(true)}
            onBlur={() =>
              setTimeout(() => setSubcategoryDropdownOpen(false), 200)
            }
            disabled={formData.mainCategories.length === 0}
          />
          {subcategorySearch && (
            <button
              type="button"
              onClick={() => setSubcategorySearch("")}
              className={styles.clearSearch}
            >
              ×
            </button>
          )}
          {subcategoryDropdownOpen && filteredSubcategories.length > 0 && (
            <div className={styles.subcategoryDropdown}>
              {filteredSubcategories.map((group) => (
                <div key={group.categoryDocId} className={styles.dropdownGroup}>
                  <div className={styles.dropdownGroupHeader}>
                    {group.categoryName}
                  </div>
                  {group.subcategories
                    .filter(
                      (sub) =>
                        !formData.subcategories.some(
                          (s) => s.documentId === sub.documentId
                        )
                    )
                    .map((sub) => (
                      <div
                        key={sub.documentId}
                        onClick={() => {
                          handleSubcategorySelect(sub, group.categoryName);
                          setSubcategorySearch("");
                          setSubcategoryDropdownOpen(false);
                        }}
                        className={styles.dropdownItem}
                      >
                        {sub.name}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}
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
              >
                <div className={styles.pillContainer}>
                  <span className={styles.parentLabel}>
                    {sub.parentName ||
                      dbCategories.find((c) =>
                        c.children?.some(
                          (child) => child.documentId === sub.documentId
                        )
                      )?.name ||
                      "Repuesto"}
                  </span>
                  <span className={styles.subLabel}>{sub.name} </span>
                </div>
                <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* MARCAS */}
      <div className={`${styles.fullWidth} ${styles.sectionMarginTop} `}>
        <label className={styles.label}>Marcas que manejas</label>
        <div className={styles.selectWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <select
            className={styles.input}
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
