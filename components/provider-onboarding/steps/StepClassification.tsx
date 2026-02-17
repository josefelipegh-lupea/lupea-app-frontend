"use client";

import React, { useState, KeyboardEvent } from "react";
import styles from "@/components/provider-onboarding/ProviderOnboarding.module.css";
import { IconsApp } from "@/components/icons/Icons";
import {
  ProviderFormData,
  StepProps,
} from "@/components/provider-onboarding/types";

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
const availableBrands = [
  "Toyota",
  "Ford",
  "Chevrolet",
  "Honda",
  "Nissan",
  "Hyundai",
  "Kia",
];

const StepClassification: React.FC<StepProps> = ({ formData, setFormData }) => {
  // Estados locales para el input y la sugerencia (igual que en tu registro)
  const [catInput, setCatInput] = useState("");
  const [catSuggestion, setCatSuggestion] = useState("");
  const [brandInput, setBrandInput] = useState("");
  const [brandSuggestion, setBrandSuggestion] = useState("");

  // Lógica de entrada (exactamente la de tu registro)
  const handleType = (
    value: string,
    list: string[],
    setInput: (v: string) => void,
    setSuggest: (v: string) => void
  ) => {
    let formatted = value;
    if (formatted.length > 0) {
      formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
    }
    setInput(formatted);

    if (formatted.trim().length > 0) {
      const match = list.find((item) =>
        item.toLowerCase().startsWith(formatted.toLowerCase())
      );
      setSuggest(match ? formatted + match.slice(formatted.length) : "");
    } else {
      setSuggest("");
    }
  };

  const addItem = (
    type: "categories" | "brands",
    value: string,
    inputSetter: (v: string) => void,
    suggestSetter: (v: string) => void
  ) => {
    const finalValue = value.trim();
    if (finalValue && !formData[type].includes(finalValue)) {
      setFormData((prev) => ({
        ...prev,
        [type]: [...prev[type], finalValue],
      }));
      inputSetter("");
      suggestSetter("");
    }
  };

  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement>,
    type: "categories" | "brands",
    input: string,
    suggestion: string,
    inputSetter: (v: string) => void,
    suggestSetter: (v: string) => void
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem(type, suggestion || input, inputSetter, suggestSetter);
    }
    if ((e.key === "ArrowRight" || e.key === "Tab") && suggestion) {
      inputSetter(suggestion);
      suggestSetter("");
    }
  };

  const removeItem = (type: "categories" | "brands", item: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((i) => i !== item),
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
          <div className={styles.ghostContainer}>{catSuggestion}</div>
          <input
            type="text"
            className={styles.input}
            value={catInput}
            onChange={(e) =>
              handleType(
                e.target.value,
                availableCategories,
                setCatInput,
                setCatSuggestion
              )
            }
            onKeyDown={(e) =>
              handleKeyDown(
                e,
                "categories",
                catInput,
                catSuggestion,
                setCatInput,
                setCatSuggestion
              )
            }
            placeholder={catSuggestion ? "" : "Escribe tus categorías"}
          />
          <button
            type="button"
            onClick={() =>
              addItem(
                "categories",
                catSuggestion || catInput,
                setCatInput,
                setCatSuggestion
              )
            }
            className={styles.addBtn}
          >
            +
          </button>
        </div>
        <small
          className={styles.helperText}
        >{`Enter o el botón "+" para agregar`}</small>

        <div className={styles.tagsScrollContainer}>
          {formData.categories.length === 0 ? (
            <p className={styles.emptyStateText}>
              Aquí aparecerán las categorías
            </p>
          ) : (
            formData.categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => removeItem("categories", cat)}
                className={`${styles.categoryPill} ${styles.activePill}`}
              >
                {cat} <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* SECCIÓN MARCAS */}
      <div className={styles.fullWidth}>
        <label className={styles.label}>¿Qué marcas manejas?</label>
        <div className={styles.inputWrapper}>
          <span className={styles.icon}>
            <IconsApp.ToolInput />
          </span>
          <div className={styles.ghostContainer}>{brandSuggestion}</div>
          <input
            type="text"
            className={styles.input}
            value={brandInput}
            onChange={(e) =>
              handleType(
                e.target.value,
                availableBrands,
                setBrandInput,
                setBrandSuggestion
              )
            }
            onKeyDown={(e) =>
              handleKeyDown(
                e,
                "brands",
                brandInput,
                brandSuggestion,
                setBrandInput,
                setBrandSuggestion
              )
            }
            placeholder={brandSuggestion ? "" : "Escribe las marcas"}
          />
          <button
            type="button"
            onClick={() =>
              addItem(
                "brands",
                brandSuggestion || brandInput,
                setBrandInput,
                setBrandSuggestion
              )
            }
            className={styles.addBtn}
          >
            +
          </button>
        </div>
        <small
          className={styles.helperText}
        >{`Enter o el botón "+" para agregar`}</small>

        <div className={styles.tagsScrollContainer}>
          {formData.brands.length === 0 ? (
            <p className={styles.emptyStateText}>Aquí aparecerán las marcas</p>
          ) : (
            formData.brands.map((brand) => (
              <button
                key={brand}
                type="button"
                onClick={() => removeItem("brands", brand)}
                className={`${styles.categoryPill} ${styles.activePill}`}
              >
                {brand} <span className={styles.removeIcon}>×</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StepClassification;
