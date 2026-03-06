"use client";

import { useState, useEffect } from "react";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import styles from "../../user/register/RegisterUser.module.css";
import vendorStyles from "./RegisterVendor.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { registerProvider } from "@/app/lib/api/auth";
import { Category, getCategories } from "@/app/lib/api/getCategories";

export default function VendorRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  // Estados para categorías dinámicas
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const venezuelaData: Record<string, string[]> = {
    Lara: ["Barquisimeto", "Cabudare", "Carora", "El Tocuyo"],
    Zulia: ["Maracaibo", "Cabimas", "Ciudad Ojeda", "San Francisco"],
    Carabobo: ["Valencia", "Puerto Cabello", "Guacara", "Naguanagua"],
    Miranda: ["Los Teques", "Guarenas", "Guatire", "Chacao"],
    Aragua: ["Maracay", "Turmero", "La Victoria", "Cagua"],
    "Distrito Capital": ["Caracas", "Chacao"],
  };

  // Carga de categorías desde la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCategories();
        // Ajustamos según si el res es el array directo o viene en .data
        const data = Array.isArray(res) ? res : res.data;
        if (data) setDbCategories(data);
      } catch (error) {
        toast.error("Error al cargar categorías");
      }
    };
    fetchData();
  }, []);

  // Manejador para agregar categoría desde el Select
  const handleSelectCategory = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number(e.target.value);
    if (!categoryId) return;

    const categoryObj = dbCategories.find((c) => c.id === categoryId);

    // Validamos que exista y que no esté ya seleccionada
    if (categoryObj && !selectedCategories.find((c) => c.id === categoryId)) {
      setSelectedCategories((prev) => [...prev, categoryObj]);
    }

    // Reseteamos el select a la opción por defecto
    e.target.value = "";
  };

  const removeCategory = (id: number) => {
    setSelectedCategories((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Registrando empresa...");

    try {
      const mainCategoriesIds = selectedCategories.map((cat) => cat.id);

      const data = await registerProvider(
        username,
        email,
        password,
        state,
        city,
        mainCategoriesIds,
        termsAccepted
      );

      toast.success(data.message || "Registro exitoso", {
        id: loadingToast,
        duration: 6000,
      });
      setTimeout(() => router.push("/login"), 2500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar proveedor";
      toast.error(errorMessage, { id: loadingToast });
      setIsLoading(false);
    }
  };

  const handleBackdropClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768 && open) {
      document.dispatchEvent(new CustomEvent("close-sheet"));
    }
    router.replace("/login");
  };

  const isValid =
    username &&
    email &&
    password &&
    state &&
    city &&
    selectedCategories.length > 0 &&
    termsAccepted;

  return (
    <div className={styles.bgWrapper} onClick={handleBackdropClick}>
      <button type="button" className={styles.backButton} aria-label="Volver">
        <IconsApp.Back />
      </button>

      <BottomSheet
        open={open}
        onClose={() => setOpen(false)}
        className={vendorStyles.customSheetWidth}
        onAnimationComplete={() => router.replace("/login")}
      >
        <div
          className={vendorStyles.gridContainer}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={vendorStyles.fullWidth}>
            <h1 className={styles.title}>Cuenta Proveedor</h1>
            <p className={styles.subtitle}>Registra tu negocio de repuestos</p>
          </div>

          {/* COLUMNA IZQUIERDA */}
          <div className={vendorStyles.leftColumn}>
            <label className={styles.label} htmlFor="vendor-name">
              Nombre de usuario
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Username />
              </span>
              <input
                id="vendor-name"
                className={styles.input}
                type="text"
                placeholder="Empresa o usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <label className={styles.label} htmlFor="vendor-email">
              Correo comercial
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Email />
              </span>
              <input
                id="vendor-email"
                className={styles.input}
                type="email"
                placeholder="negocio@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Estado</label>
                <div className={vendorStyles.selectWrapper}>
                  <select
                    className={styles.input}
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setCity("");
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {Object.keys(venezuelaData).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <div className={vendorStyles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <label className={styles.label}>Ciudad</label>
                <div className={vendorStyles.selectWrapper}>
                  <select
                    className={styles.input}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!state}
                  >
                    <option value="">Seleccionar</option>
                    {state &&
                      venezuelaData[state]?.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  <div className={vendorStyles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className={vendorStyles.rightColumn}>
            <label className={styles.label}>¿Qué repuestos vendes?</label>
            <div className={vendorStyles.selectWrapper}>
              <select
                className={styles.input}
                onChange={handleSelectCategory}
                defaultValue=""
              >
                <option value="" disabled>
                  Selecciona tus categorías
                </option>
                {dbCategories.map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={selectedCategories.some((s) => s.id === cat.id)}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className={vendorStyles.iconOverlay}>
                <IconsApp.DownArrow />
              </div>
            </div>

            <div
              className={vendorStyles.tagsScrollContainer}
              style={{ marginTop: "10px" }}
            >
              {selectedCategories.length === 0 ? (
                <p className={vendorStyles.emptyStateText}>
                  Selecciona categorías de la lista
                </p>
              ) : (
                selectedCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => removeCategory(cat.id)}
                    className={`${vendorStyles.categoryPill} ${vendorStyles.activePill}`}
                  >
                    {cat.name}{" "}
                    <span className={vendorStyles.removeIcon}>×</span>
                  </button>
                ))
              )}
            </div>

            <label
              className={styles.label}
              htmlFor="vendor-pass"
              style={{ marginTop: "15px" }}
            >
              Contraseña
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <IconsApp.Password />
              </span>
              <input
                id="vendor-pass"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.eyeButton}
                onClick={() => setShowPassword(!showPassword)}
              >
                {!showPassword ? (
                  <IconsApp.EyePassword />
                ) : (
                  <IconsApp.EyePasswordOff />
                )}
              </button>
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
