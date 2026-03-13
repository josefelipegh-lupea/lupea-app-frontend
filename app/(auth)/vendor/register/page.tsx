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

export default function VendorRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [lastSelectedCatId, setLastSelectedCatId] = useState<string | null>(
    null
  );
  const [selectedSubs, setSelectedSubs] = useState<SelectedSub[]>([]);

  const parentIds = useMemo(() => {
    return Array.from(
      new Set(
        selectedSubs.map((s) => {
          const parent = dbCategories.find((cat) => cat.name === s.parentName);
          return parent?.id;
        })
      )
    ).filter((id): id is number => !!id);
  }, [selectedSubs, dbCategories]);

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

  const currentSubcategories = useMemo(() => {
    if (!lastSelectedCatId) return [];
    const selectedCat = dbCategories.find(
      (c) => c.documentId === lastSelectedCatId
    );
    return selectedCat?.children || [];
  }, [lastSelectedCatId, dbCategories]);

  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = Number(e.target.value);
    if (!subId || !lastSelectedCatId) return;

    // Buscamos el objeto en las subcategorías actuales
    const subObj = currentSubcategories.find((s) => s.id === subId);
    // Buscamos el nombre del padre para la pill
    const parentObj = dbCategories.find(
      (c) => c.documentId === lastSelectedCatId
    );

    if (subObj && parentObj && !selectedSubs.find((s) => s.id === subId)) {
      setSelectedSubs((prev) => [
        ...prev,
        {
          id: subObj.id,
          documentId: subObj.documentId,
          name: subObj.name,
          parentName: parentObj.name,
        },
      ]);
    }

    // ESTO ES LO QUE HACE QUE EL SELECT VUELVA A MOSTRAR EL "Selecciona subcategorías"
    e.target.value = "";
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
                onChange={(e) => setLastSelectedCatId(e.target.value)}
                value={lastSelectedCatId || ""}
              >
                <option value="" disabled>
                  Selecciona categorías
                </option>
                {dbCategories.map((cat) => (
                  <option key={cat.documentId} value={cat.documentId}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className={vendorStyles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>

            <label className={styles.label} style={{ marginTop: "15px" }}>
              Especifica las subcategorías
            </label>
            <div className={vendorStyles.selectWrapper}>
              <select
                className={styles.input}
                onChange={handleSubcategoryChange}
                value=""
                disabled={currentSubcategories.length === 0}
              >
                <option value="" disabled>
                  {!lastSelectedCatId
                    ? "Selecciona una categoría arriba"
                    : currentSubcategories.length === 0
                    ? "Esta categoría no tiene subcategorías"
                    : "Selecciona subcategorías"}
                </option>
                {currentSubcategories
                  .filter((sub) => !selectedSubs.some((s) => s.id === sub.id))
                  .map((sub) => (
                    <option key={sub.documentId} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
              </select>
              <div className={vendorStyles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
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
