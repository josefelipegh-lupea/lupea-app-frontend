"use client";

import { useState, useEffect, useMemo } from "react";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import styles from "../../user/register/RegisterUser.module.css";
import vendorStyles from "./RegisterVendor.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { registerProvider } from "@/app/lib/api/auth";
import { Category, getCategories } from "@/app/lib/api/getCategories";
import { useProviderRegisterValidation } from "../../../../hooks/useRegisterProviderValidation";
import MultiSelectDropdown from "@/components/multi-select/MultiSelectDropdown";

interface SelectedSub {
  id: number;
  documentId: string;
  name: string;
  parentName: string;
}

interface SelectedMainCategory {
  id: number;
  name: string;
  documentId: string;
}

export default function VendorRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedMainCategories, setSelectedMainCategories] = useState<
    SelectedMainCategory[]
  >([]);
  const [selectedSubs, setSelectedSubs] = useState<SelectedSub[]>([]);

  const allSubcategoriesFromSelected = useMemo(() => {
    if (selectedMainCategories.length === 0) return [];
    return [...selectedMainCategories]
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
  }, [selectedMainCategories, dbCategories]);

  const mainCategoryGroups = useMemo(
    () => [
      {
        key: "main-categories",
        options: dbCategories.map((cat) => ({
          id: cat.documentId,
          label: cat.name,
        })),
      },
    ],
    [dbCategories]
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

  const parentIds = useMemo(() => {
    return selectedMainCategories.map((c) => c.id);
  }, [selectedMainCategories]);

  const subIds = useMemo(() => selectedSubs.map((s) => s.id), [selectedSubs]);

  const { isValid, errors } = useProviderRegisterValidation({
    username,
    email,
    password,
    mainCategories: parentIds,
    subcategories: subIds,
    termsAccepted,
  });
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCategories();
        const data = Array.isArray(res) ? res : res.data;
        if (data) setDbCategories(data);
      } catch (error) {
        toast.error("Error al cargar categorías");
      }
    };
    fetchData();
  }, []);

  const handleSelectAllCategories = () => {
    setSelectedMainCategories(
      dbCategories.map((c) => ({ id: c.id, documentId: c.documentId, name: c.name }))
    );
  };

  const handleClearAllCategories = () => {
    setSelectedMainCategories([]);
    setSelectedSubs([]);
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
    setSelectedSubs(allSubs);
  };

  const handleClearAllSubcategories = () => {
    setSelectedSubs([]);
  };

  const handleMainCategoryToggle = (documentId: string | number) => {
    const docId = String(documentId);
    if (selectedMainCategories.some((cat) => cat.documentId === docId)) {
      removeMainCategory(docId);
      return;
    }

    const category = dbCategories.find((c) => c.documentId === docId);
    if (!category) return;

    setSelectedMainCategories((prev) => [
      ...prev,
      {
        id: category.id,
        name: category.name,
        documentId: category.documentId,
      },
    ]);
  };

  const removeMainCategory = (documentId: string) => {
    const categoryToRemove = dbCategories.find(
      (c) => c.documentId === documentId
    );
    const subcategoryIdsToRemove =
      categoryToRemove?.children?.map((sub) => sub.id) || [];

    setSelectedMainCategories((prev) =>
      prev.filter((c) => c.documentId !== documentId)
    );
    setSelectedSubs((prev) =>
      prev.filter((sub) => !subcategoryIdsToRemove.includes(sub.id))
    );
  };

  const handleSubcategoryToggle = (documentId: string | number) => {
    const docId = String(documentId);
    const existing = selectedSubs.find((s) => s.documentId === docId);
    if (existing) {
      removeSub(existing.id);
      return;
    }

    const parentGroup = allSubcategoriesFromSelected.find((group) =>
      group.subcategories.some((sub) => sub.documentId === docId)
    );
    const subcategory = parentGroup?.subcategories.find(
      (sub) => sub.documentId === docId
    );

    if (!subcategory || !parentGroup) return;

    setSelectedSubs((prev) => [
      ...prev,
      {
        id: subcategory.id,
        documentId: subcategory.documentId,
        name: subcategory.name,
        parentName: parentGroup.categoryName,
      },
    ]);
  };

  const removeSub = (id: number) => {
    setSelectedSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isValid || isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Registrando proveedor...");
    try {
      await registerProvider(
        username,
        email,
        password,
        parentIds,
        subIds,
        termsAccepted
      );
      toast.success("Registro exitoso", { id: loadingToast });
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      if (err instanceof Error)
        toast.error(err.message || "Error al registrar", { id: loadingToast });
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.bgWrapper} onClick={() => router.replace("/login")}>
      <button type="button" className={styles.backButton} aria-label="Volver">
        <IconsApp.Back />
      </button>
      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        className={vendorStyles.customSheetWidth}
      >
        <div
          className={vendorStyles.gridContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={vendorStyles.fullWidth}>
            <h1 className={styles.title}>Cuenta Proveedor</h1>
            <p className={styles.subtitle}>
              Selecciona tus categorías de venta
            </p>
          </div>

          <div className={vendorStyles.leftColumn}>
            <label className={styles.label}>Nombre de usuario <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Username />
              </span>
              <input
                className={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="respuestos-jhon"
              />
            </div>
            {submitted && errors.username && (
              <p className={styles.fieldError}>{errors.username[0]}</p>
            )}

            <label className={styles.label}>Correo comercial <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Email />
              </span>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@empresa.com"
              />
            </div>
            {submitted && errors.email && (
              <p className={styles.fieldError}>{errors.email[0]}</p>
            )}

            <label className={styles.label}>Contraseña <span className={styles.required}>*</span></label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Password />
              </span>
              <input
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <IconsApp.EyePasswordOff />
                ) : (
                  <IconsApp.EyePassword />
                )}
              </button>
            </div>
            {submitted && errors.password && (
              <p className={styles.fieldError}>{errors.password[0]}</p>
            )}
          </div>

          <div className={vendorStyles.rightColumn}>
            <label className={styles.label}>¿Qué repuestos vendes? <span className={styles.required}>*</span></label>
            <MultiSelectDropdown
              placeholder="Selecciona categorías"
              selectedCountLabel="categorías"
              groups={mainCategoryGroups}
              selectedIds={selectedMainCategories.map((cat) => cat.documentId)}
              onToggle={handleMainCategoryToggle}
              onSelectAll={handleSelectAllCategories}
              onClearAll={handleClearAllCategories}
              searchPlaceholder="Buscar categorías..."
              noResultsText="No hay categorías"
              icon={<IconsApp.ToolInput />}
            />

            <div className={vendorStyles.tagsScrollContainer}>
              {selectedMainCategories.length === 0 ? (
                <p className={vendorStyles.emptyStateText}>
                  Aquí aparecerán las categorías
                </p>
              ) : (
                selectedMainCategories.map((cat) => (
                  <button
                    key={cat.documentId}
                    type="button"
                    onClick={() => removeMainCategory(cat.documentId)}
                    className={`${vendorStyles.categoryPill} ${vendorStyles.activePill}`}
                  >
                    <span className={vendorStyles.subLabel}>{cat.name} </span>
                    <span className={vendorStyles.removeIcon}>×</span>
                  </button>
                ))
              )}
            </div>

            <label className={`${styles.label} ${styles.labelSpaced}`}>
              Especifica las subcategorías <span className={styles.required}>*</span>
            </label>
            <MultiSelectDropdown
              placeholder={
                selectedMainCategories.length === 0
                  ? "Selecciona una categoría arriba"
                  : "Selecciona subcategorías"
              }
              selectedCountLabel="subcategorías"
              groups={subcategoryGroups}
              selectedIds={selectedSubs.map((sub) => sub.documentId)}
              onToggle={handleSubcategoryToggle}
              onSelectAll={selectedMainCategories.length > 0 ? handleSelectAllSubcategories : undefined}
              onClearAll={selectedSubs.length > 0 ? handleClearAllSubcategories : undefined}
              disabled={selectedMainCategories.length === 0}
              searchPlaceholder="Buscar subcategorías..."
              noResultsText="No hay subcategorías"
              icon={<IconsApp.ToolInput />}
            />

            <div className={vendorStyles.tagsScrollContainer}>
              {selectedSubs.length === 0 ? (
                <p className={vendorStyles.emptyStateText}>
                  Aquí aparecerán tus elecciones
                </p>
              ) : (
                selectedSubs.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => removeSub(sub.id)}
                    className={`${vendorStyles.categoryPill} ${vendorStyles.activePill}`}
                  >
                    <div className={vendorStyles.pillContainer}>
                      <span className={vendorStyles.parentLabel}>
                        {sub.parentName}
                      </span>
                      <span className={vendorStyles.subLabel}>{sub.name} </span>
                    </div>
                    <span className={vendorStyles.removeIcon}>×</span>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={vendorStyles.fullWidth}>
            <div className={styles.termsRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span className={styles.customCheckbox} />
                <span className={styles.termsText}>
                  Acepto términos y políticas
                </span>
              </label>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={!isValid || isLoading}
            >
              {isLoading ? "Registrando..." : "Registrar Empresa"}
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
