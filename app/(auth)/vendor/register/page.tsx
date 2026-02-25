"use client";

import { useState, KeyboardEvent } from "react";
import BottomSheet from "@/components/bottom-sheet/BottomSheet";
import styles from "../../user/register/RegisterUser.module.css";
import vendorStyles from "./RegisterVendor.module.css";
import { IconsApp } from "@/components/icons/Icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { registerProvider } from "@/app/lib/api/auth";

export default function VendorRegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryInput, setCategoryInput] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [open, setOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const availableCategories = [
    "Motor",
    "Frenos",
    "Suspensión",
    "Carrocería",
    "Eléctrico",
    "Amortiguadores",
    "Aceite",
    "Baterías",
  ];

  const categoryMap: Record<string, number> = {
    Motor: 1,
    Frenos: 2,
    Suspensión: 3,
    Carrocería: 4,
    Eléctrico: 5,
    Amortiguadores: 6,
    Aceite: 7,
    Baterías: 8,
  };

  const venezuelaData: Record<string, string[]> = {
    Lara: ["Barquisimeto", "Cabudare", "Carora", "El Tocuyo"],
    Zulia: ["Maracaibo", "Cabimas", "Ciudad Ojeda", "San Francisco"],
    Carabobo: ["Valencia", "Puerto Cabello", "Guacara", "Naguanagua"],
    Miranda: ["Los Teques", "Guarenas", "Guatire", "Chacao"],
    Aragua: ["Maracay", "Turmero", "La Victoria", "Cagua"],
    "Distrito Capital": ["Caracas", "Chacao"],
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    if (value.length > 0) {
      value = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setCategoryInput(value);

    if (value.trim().length > 0) {
      const match = availableCategories.find((cat) =>
        cat.toLowerCase().startsWith(value.toLowerCase())
      );

      setSuggestion(match ? value + match.slice(value.length) : "");
    } else {
      setSuggestion("");
    }
  };

  const addCategory = () => {
    const finalValue = suggestion || categoryInput.trim();
    if (finalValue && !categories.includes(finalValue)) {
      setCategories((prev) => [...prev, finalValue]);
      setCategoryInput("");
      setSuggestion("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addCategory();
    }
    if ((e.key === "ArrowRight" || e.key === "Tab") && suggestion) {
      setCategoryInput(suggestion);
      setSuggestion("");
    }
  };

  const removeCategory = (cat: string) => {
    setCategories((prev) => prev.filter((c) => c !== cat));
  };

  const handleBackdropClick = () => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      if (open) {
        document.dispatchEvent(new CustomEvent("close-sheet"));
      }
    }
    router.replace("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isLoading) return;

    setIsLoading(true);
    const loadingToast = toast.loading("Registrando empresa...");

    try {
      // 1. Convertimos los strings de categorías a IDs numéricos
      const mainCategoriesIds = categories
        .map((cat) => categoryMap[cat])
        .filter((id) => id !== undefined);

      // 2. Llamada al endpoint
      const data = await registerProvider(
        username,
        email,
        password,
        state,
        city,
        mainCategoriesIds,
        termsAccepted
      );

      toast.success(data.message, { id: loadingToast, duration: 6000 });

      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al registrar proveedor";

      toast.error(errorMessage, { id: loadingToast });
      setIsLoading(false);
    }
  };

  const isValid =
    username &&
    email &&
    password &&
    state &&
    city &&
    categories.length > 0 &&
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
        <div className={vendorStyles.gridContainer}>
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
              {/* SELECT DE ESTADO */}
              <div style={{ flex: 1 }}>
                <label className={styles.label}>Estado</label>
                <div className={vendorStyles.selectWrapper}>
                  <select
                    className={styles.input}
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setCity(""); // Limpiar ciudad al cambiar estado
                    }}
                  >
                    <option value="">Seleccionar</option>
                    {Object.keys(venezuelaData).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SELECT DE CIUDAD */}
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
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA */}
          <div className={vendorStyles.rightColumn}>
            {/* NUEVA SECCIÓN DE CATEGORÍAS */}
            <label className={styles.label}>¿Qué repuestos vendes?</label>
            <div className={vendorStyles.searchWrapper}>
              <span className={vendorStyles.briefcaseIcon}>
                <span className={vendorStyles.toolIcon}>
                  <IconsApp.ToolInput />
                </span>
              </span>
              <div className={vendorStyles.ghostContainer}>{suggestion}</div>
              <input
                type="text"
                className={vendorStyles.searchInput}
                value={categoryInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={suggestion ? "" : "Escribe tus categorías"}
              />
              <button
                type="button"
                onClick={addCategory}
                className={vendorStyles.addBtn}
              >
                +
              </button>
            </div>
            <small className={vendorStyles.helperText}>
              Enter o el botón &quot;+&quot; para agregar
            </small>

            <div className={vendorStyles.tagsScrollContainer}>
              {categories.length === 0 ? (
                <p className={vendorStyles.emptyStateText}>
                  Aquí aparecerán las categorías que agregues
                </p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => removeCategory(cat)}
                    className={`${vendorStyles.categoryPill} ${vendorStyles.activePill}`}
                  >
                    {cat} <span className={vendorStyles.removeIcon}>×</span>
                  </button>
                ))
              )}
            </div>

            <label className={styles.label} htmlFor="vendor-pass">
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
