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
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [subcategoryDropdownOpen, setSubcategoryDropdownOpen] = useState(false);

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

  const parentIds = useMemo(() => {
    return selectedMainCategories.map((c) => c.id);
  }, [selectedMainCategories]);

  const subIds = useMemo(() => selectedSubs.map((s) => s.id), [selectedSubs]);

  const { isValid } = useProviderRegisterValidation({
    username,
    email,
    password,
    mainCategories: parentIds,
    subcategories: subIds,
    termsAccepted,
  });
  const router = useRouter();

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

  const handleMainCategorySelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = e.target.value;
    if (!selectedValue) return;

    const category = dbCategories.find((c) => c.documentId === selectedValue);
    if (
      category &&
      !selectedMainCategories.some((c) => c.documentId === selectedValue)
    ) {
      setSelectedMainCategories((prev) => [
        ...prev,
        {
          id: category.id,
          name: category.name,
          documentId: category.documentId,
        },
      ]);
    }
    e.target.value = "";
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

  const handleSubcategorySelect = (sub: Category, categoryName: string) => {
    if (selectedSubs.some((s) => s.documentId === sub.documentId)) return;
    setSelectedSubs((prev) => [
      ...prev,
      {
        id: sub.id,
        documentId: sub.documentId,
        name: sub.name,
        parentName: categoryName,
      },
    ]);
  };

  const removeSub = (id: number) => {
    setSelectedSubs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            <label className={styles.label}>Nombre de usuario</label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Username />
              </span>
              <input
                className={styles.input}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ej. Repuestos Jhon"
              />
            </div>

            <label className={styles.label}>Correo comercial</label>
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

            <label className={styles.label}>Contraseña</label>
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
          </div>

          <div className={vendorStyles.rightColumn}>
            <label className={styles.label}>¿Qué repuestos vendes?</label>
            <div className={vendorStyles.selectWrapper}>
              <select
                className={styles.input}
                onChange={handleMainCategorySelect}
                value=""
              >
                <option value="" disabled>
                  Selecciona categorías
                </option>
                {dbCategories
                  .filter(
                    (cat) =>
                      !selectedMainCategories.some(
                        (c) => c.documentId === cat.documentId
                      )
                  )
                  .map((cat) => (
                    <option key={cat.documentId} value={cat.documentId}>
                      {cat.name}
                    </option>
                  ))}
              </select>
              <div className={vendorStyles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>

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

            <label className={styles.label} style={{ marginTop: "15px" }}>
              Especifica las subcategorías
            </label>
            <div className={vendorStyles.subcategoryInputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.ToolInput />
              </span>
              <input
                type="text"
                className={styles.input}
                placeholder={
                  selectedMainCategories.length === 0
                    ? "Selecciona una categoría arriba"
                    : "Buscar subcategorías..."
                }
                value={subcategorySearch}
                onChange={(e) => setSubcategorySearch(e.target.value)}
                onFocus={() => setSubcategoryDropdownOpen(true)}
                onBlur={() =>
                  setTimeout(() => setSubcategoryDropdownOpen(false), 200)
                }
                disabled={selectedMainCategories.length === 0}
              />
              {subcategorySearch && (
                <button
                  type="button"
                  onClick={() => setSubcategorySearch("")}
                  className={vendorStyles.clearSearch}
                >
                  ×
                </button>
              )}
              {subcategoryDropdownOpen && filteredSubcategories.length > 0 && (
                <div className={vendorStyles.subcategoryDropdown}>
                  {filteredSubcategories.map((group) => (
                    <div key={group.categoryDocId} className={vendorStyles.dropdownGroup}>
                      <div className={vendorStyles.dropdownGroupHeader}>
                        {group.categoryName}
                      </div>
                      {group.subcategories
                        .filter(
                          (sub) =>
                            !selectedSubs.some(
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
                            className={vendorStyles.dropdownItem}
                          >
                            {sub.name}
                          </div>
                        ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
