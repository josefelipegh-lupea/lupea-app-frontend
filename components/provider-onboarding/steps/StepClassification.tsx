"use client";

import React, { useEffect, useState, useMemo } from "react";
import styles from "../ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { StepProps } from "@/components/provider-onboarding/types";
import { Category, getCategories } from "@/app/lib/api/getCategories";
import toast from "react-hot-toast";
import { getBrands, VehicleItem } from "@/app/lib/api/client/vehicle";
import { useAuth } from "@/context/AuthContext";
import MultiSelectDropdown from "@/components/multi-select/MultiSelectDropdown";
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

  const mainCategoryGroups = useMemo(
    () => [
      {
        key: "main-categories",
        options: dbCategories.map((cat) => ({
          id: cat.id,
          label: cat.name,
        })),
      },
    ],
    [dbCategories]
  );

  const brandGroups = useMemo(
    () => [
      {
        key: "brands",
        options: dbBrands.map((b) => ({
          id: (b as unknown as BrandWithId).id,
          label: b.name,
        })),
      },
    ],
    [dbBrands]
  );

  const subcategoryGroups = useMemo(
    () =>
      allSubcategoriesFromSelected.map((group) => ({
        key: group.categoryDocId,
        label: group.categoryName,
        options: group.subcategories.map((sub) => ({
          id: sub.documentId,
          label: sub.name,
        })),
      })),
    [allSubcategoriesFromSelected]
  );

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

  const toggleBrand = (id: string | number) => {
    const numericId = Number(id);
    const brand = dbBrands.find((b) => (b as unknown as BrandWithId).id === numericId);
    if (!brand) return;
    const exists = formData.brands.some((b) => b.id === numericId);
    if (exists) {
      removeItem("brands", brand.documentId);
    } else {
      setFormData((prev) => ({
        ...prev,
        brands: [
          ...prev.brands,
          { id: numericId, name: brand.name, documentId: brand.documentId },
        ],
      }));
    }
  };

  const handleSelectAllCategories = () => {
    setFormData((prev) => ({
      ...prev,
      mainCategories: dbCategories.map((c) => ({
        id: c.id,
        documentId: c.documentId,
        name: c.name,
      })),
    }));
  };

  const handleClearAllCategories = () => {
    setLastSelectedCatId(null);
    setFormData((prev) => ({ ...prev, mainCategories: [], subcategories: [] }));
  };

  const handleSelectAllSubcategories = () => {
    const allSubs = allSubcategoriesFromSelected.flatMap((group) =>
      group.subcategories.map((sub) => ({
        id: sub.id,
        documentId: sub.documentId,
        name: sub.name,
        parentName: group.categoryName,
      }))
    );
    setFormData((prev) => ({ ...prev, subcategories: allSubs }));
  };

  const handleClearAllSubcategories = () => {
    setFormData((prev) => ({ ...prev, subcategories: [] }));
  };

  const handleSelectAllBrands = () => {
    setFormData((prev) => ({
      ...prev,
      brands: dbBrands.map((b) => ({
        id: (b as unknown as BrandWithId).id || 0,
        name: b.name,
        documentId: b.documentId,
      })),
    }));
  };

  const handleClearAllBrands = () => {
    setFormData((prev) => ({ ...prev, brands: [] }));
  };

  const toggleMainCategory = (id: string | number) => {
    const categoryId = Number(id);
    const selectedCategory = dbCategories.find((cat) => cat.id === categoryId);
    if (!selectedCategory) return;

    const exists = formData.mainCategories.some(
      (cat) => cat.documentId === selectedCategory.documentId
    );

    if (exists) {
      removeItem("mainCategories", selectedCategory.documentId);
      return;
    }

    setLastSelectedCatId(selectedCategory.documentId);
    setFormData((prev) => ({
      ...prev,
      mainCategories: [
        ...prev.mainCategories,
        {
          id: selectedCategory.id,
          name: selectedCategory.name,
          documentId: selectedCategory.documentId,
        },
      ],
    }));
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

  const toggleSubcategory = (id: string | number) => {
    const documentId = String(id);
    const existing = formData.subcategories.find(
      (sub) => sub.documentId === documentId
    );

    if (existing) {
      removeItem("subcategories", documentId);
      return;
    }

    const parentGroup = allSubcategoriesFromSelected.find((group) =>
      group.subcategories.some((sub) => sub.documentId === documentId)
    );
    const subcategory = parentGroup?.subcategories.find(
      (sub) => sub.documentId === documentId
    );

    if (!parentGroup || !subcategory) return;
    handleSubcategorySelect(subcategory, parentGroup.categoryName);
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
          Categorías en la que clasifica tu negocio <span className={styles.required}>*</span>
        </label>
        <MultiSelectDropdown
          placeholder="Selecciona categorías"
          selectedCountLabel="categorías"
          groups={mainCategoryGroups}
          selectedIds={formData.mainCategories.map((cat) => cat.id)}
          onToggle={toggleMainCategory}
          onSelectAll={handleSelectAllCategories}
          onClearAll={handleClearAllCategories}
          searchPlaceholder="Buscar categorías..."
          noResultsText="No hay categorías"
          icon={<IconsApp.ToolInput />}
        />
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
      <div className={`${styles.fullWidth} ${styles.sectionMarginTop}`}>
        <label className={styles.label}>Subcategorías <span className={styles.required}>*</span></label>
        <MultiSelectDropdown
          placeholder={
            formData.mainCategories.length === 0
              ? "Selecciona categoría arriba"
              : "Selecciona subcategorías"
          }
          selectedCountLabel="subcategorías"
          groups={subcategoryGroups}
          selectedIds={formData.subcategories.map((sub) => sub.documentId)}
          onToggle={toggleSubcategory}
          onSelectAll={formData.mainCategories.length > 0 ? handleSelectAllSubcategories : undefined}
          onClearAll={formData.subcategories.length > 0 ? handleClearAllSubcategories : undefined}
          disabled={formData.mainCategories.length === 0}
          searchPlaceholder="Buscar subcategorías..."
          noResultsText="No hay subcategorías"
          icon={<IconsApp.ToolInput />}
        />
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
        <label className={styles.label}>Marcas que manejas <span className={styles.required}>*</span></label>
        <MultiSelectDropdown
          placeholder="Selecciona marcas"
          selectedCountLabel="marcas"
          groups={brandGroups}
          selectedIds={formData.brands.map((b) => b.id)}
          onToggle={toggleBrand}
          onSelectAll={handleSelectAllBrands}
          onClearAll={handleClearAllBrands}
          searchPlaceholder="Buscar marcas..."
          noResultsText="No hay marcas"
          icon={<IconsApp.ToolInput />}
        />
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
