"use client";

import React from "react";
import styles from "./StepCommercialTerms.module.css";
import InputField from "@/components/input/InputField";
import { StepProps } from "@/components/provider-onboarding/types";
import { IconsApp } from "@/components/icons/Icons";

interface ExtendedStepProps extends StepProps {
  mode?: "sales" | "logistics" | "all";
}

export default function StepCommercialTerms({
  formData,
  setFormData,
  handleChange,
  mode = "all",
}: ExtendedStepProps) {
  const toggleItem = (
    list: string[] = [],
    item: string,
    field: "paymentMethods" | "nationalCarriers"
  ) => {
    const newList = list.includes(item)
      ? list.filter((i) => i !== item)
      : [...list, item];

    setFormData({
      ...formData,
      [field]: newList,
    });
  };

  const handleCheckboxChange = (
    field: keyof typeof formData,
    value: boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div
      className={`${styles.container} ${mode === "all" ? styles.containerWithGap : ""}`}
    >
      {/* SECCIÓN: CONDICIONES DE VENTA */}
      {(mode === "all" || mode === "sales") && (
        <section className={styles.section}>
          {mode === "all" && (
            <h3 className={styles.title}>Condiciones de Venta</h3>
          )}

          <label className={styles.label}>Métodos de pago aceptados <span className={styles.required}>*</span></label>
          <div className={styles.chips}>
            {[
              "Zelle",
              "Pago Móvil",
              "Efectivo",
              "Transferencia",
              "Binance",
            ].map((m) => (
              <button
                key={m}
                type="button"
                className={`${styles.chip} ${
                  formData.paymentMethods?.includes(m) ? styles.chipActive : ""
                }`}
                onClick={() =>
                  toggleItem(formData.paymentMethods, m, "paymentMethods")
                }
              >
                {m}
              </button>
            ))}
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Garantía General</label>
              <div className={styles.selectWrapper}>
                <select
                  className={styles.select}
                  name="warrantyPolicy"
                  value={formData.warrantyPolicy}
                  onChange={handleChange}
                >
                  <option value="Sin garantía">Sin garantía</option>
                  <option value="3 meses">3 meses</option>
                  <option value="6 meses">6 meses</option>
                  <option value="12 meses">12 meses</option>
                </select>
                <div className={styles.iconOverlay}>
                  <IconsApp.DownArrow />
                </div>
              </div>
            </div>
          </div>

          <InputField
            name="returnPolicy"
            label="Políticas de devolución (Opcional)"
            placeholder="Ej: 48 horas para reportar fallas..."
            value={formData.returnPolicy}
            onChange={handleChange}
          />
        </section>
      )}

      {/* SECCIÓN: LOGÍSTICA */}
      {(mode === "all" || mode === "logistics") && (
        <section className={styles.section}>
          {mode === "all" && (
            <h3 className={styles.title}>Logística y Entrega</h3>
          )}

          <h4 className={styles.subTitle}>Método de envío</h4>

          <div className={styles.checkboxes}>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={formData.hasStorePickup}
                onChange={(e) =>
                  handleCheckboxChange("hasStorePickup", e.target.checked)
                }
              />
              <span>Retiro en tienda</span>
            </label>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={formData.hasLocalDelivery}
                onChange={(e) =>
                  handleCheckboxChange("hasLocalDelivery", e.target.checked)
                }
              />
              <span>Envío local (Delivery)</span>
            </label>
            <label className={styles.checkItem}>
              <input
                type="checkbox"
                checked={formData.hasNationalDelivery}
                onChange={(e) =>
                  handleCheckboxChange("hasNationalDelivery", e.target.checked)
                }
              />
              <span>Envío nacional</span>
            </label>
          </div>

          <label className={styles.label}>Agencias de envío</label>
          <div className={styles.chips}>
            {["MRW", "Zoom", "Tealca", "Domesa", "Agencia propia"].map((c) => (
              <button
                key={c}
                type="button"
                className={`${styles.chip} ${
                  formData.nationalCarriers?.includes(c)
                    ? styles.chipActive
                    : ""
                }`}
                onClick={() =>
                  toggleItem(formData.nationalCarriers, c, "nationalCarriers")
                }
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
