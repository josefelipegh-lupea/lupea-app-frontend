"use client";

import { useEffect, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import { FormData } from "@/app/(dashboard)/home/user/request/page";
import StepTransition from "../provider-onboarding/step-transition/StepTransition";
import { Category } from "@/app/lib/api/getCategories";

export interface SparePart {
  category: string;
  partName: string;
  oemCode: string;
  quantity: number;
  condition: string;
}

interface SparePartsStepProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  categories: Category[];
}

export default function SparePartsStep({
  formData,
  setFormData,
  contentRef,
  categories,
}: SparePartsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [direction, setDirection] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  // const categories = [
  //   "Suspensión y Dirección",
  //   "Motor",
  //   "Frenos",
  //   "Transmisión",
  // ];
  const conditions = [
    { id: "no_importa", label: "Cualquiera" },
    { id: "original", label: "Original" },
    { id: "alternativa", label: "Alternativa" },
    { id: "usado", label: "Usado" },
  ];

  const selectedCategoryObj = categories.find(
    (c) => c.name === formData.category
  );
  console.log(categories);
  const subCategories = selectedCategoryObj?.children || [];

  const scrollToCard = () => {
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const goToForm = () => {
    setDirection(1);
    setShowForm(true);
    scrollToCard();
  };

  const goToList = () => {
    setDirection(-1);
    setShowForm(false);
    scrollToCard();
  };

  const checkScroll = () => {
    const el = listRef.current;
    if (el) {
      const isScrollable = el.scrollHeight > el.clientHeight;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 5;
      setShowScrollArrow(isScrollable && !isAtBottom);
    }
  };

  const scrollToNextSparePart = () => {
    const el = listRef.current;
    if (!el) return;

    const items = el.querySelectorAll(`.${styles.vehicleItem}`);
    if (!items.length) return;

    const itemHeight = (items[0] as HTMLElement).offsetHeight;

    const currentIndex = Math.round(el.scrollTop / itemHeight);
    const nextIndex = Math.min(currentIndex + 1, items.length - 1);

    el.scrollTo({
      top: nextIndex * itemHeight,
      behavior: "smooth",
    });
  };

  // --- Lógica de Edición y Eliminación ---
  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingIndex(index);

    // 2. Esperamos a que termine el CSS (300ms)
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        spareParts: prev.spareParts.filter((_, i) => i !== index),
      }));
      // 3. Limpiamos el índice que se estaba borrando
      setDeletingIndex(null);
    }, 300);
  };

  const handleEdit = (index: number) => {
    const partToEdit = formData.spareParts[index];
    setFormData((prev) => ({
      ...prev,
      category: partToEdit.category,
      partName: partToEdit.partName,
      oemCode: partToEdit.oemCode,
      quantity: partToEdit.quantity,
      condition: partToEdit.condition,
      spareParts: prev.spareParts.filter((_, i) => i !== index),
    }));
    goToForm();
  };

  // --- Handlers del Formulario ---
  const handleAddSparePart = () => {
    if (!formData.partName) return;
    setFormData((prev) => ({
      ...prev,
      spareParts: [
        ...prev.spareParts,
        {
          category: prev.category,
          partName: prev.partName,
          oemCode: prev.oemCode,
          quantity: prev.quantity,
          condition: prev.condition,
        },
      ],
      category: "",
      partName: "",
      oemCode: "",
      quantity: 1,
      condition: "no_importa",
    }));
    goToList();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { partName: "" } : {}),
    }));
  };

  const handleQuantity = (val: number) => {
    setFormData((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + val),
    }));
  };

  const handleCondition = (id: string) => {
    setFormData((prev) => ({ ...prev, condition: id }));
  };

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      checkScroll();
    });

    return () => cancelAnimationFrame(frameId);
  }, [setShowForm, formData.spareParts]);

  return (
    <section
      ref={cardRef}
      className={styles.cardVehicleStep}
      style={{ scrollMarginTop: "20px" }}
    >
      <div className={styles.cardHeader}>
        <div className={styles.iconBox}>
          <div className={styles.iconWrapper}>
            <IconsApp.Gear color="#f58220" />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h2 className={styles.cardTitle}>Datos del Repuesto</h2>
        </div>
        {showForm && (
          <button type="button" className={styles.backBtn} onClick={goToList}>
            Ver Lista
          </button>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.cardBody}>
        <StepTransition stepKey={showForm ? 2 : 1} direction={direction}>
          {!showForm ? (
            /* ===== VISTA 1: LISTA ===== */
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Repuestos solicitados</label>
                <div className={styles.listWrapper}>
                  <div
                    className={styles.vehicleList}
                    ref={listRef}
                    onScroll={checkScroll}
                  >
                    {formData.spareParts.length === 0 ? (
                      <div className={styles.noVehicles}>
                        No hay repuestos aún
                      </div>
                    ) : (
                      formData.spareParts.map((part, index) => (
                        <div
                          key={index}
                          className={`${styles.vehicleItem} ${
                            deletingIndex === index ? styles.fadeOut : ""
                          }`}
                        >
                          <div
                            className={styles.vehicleInfo}
                            onClick={() => handleEdit(index)}
                            style={{ cursor: "pointer" }}
                          >
                            <span className={styles.vName}>
                              {part.partName}
                            </span>
                            <span className={styles.vDetails}>
                              {part.category} • x{part.quantity} •{" "}
                              {
                                conditions.find((c) => c.id === part.condition)
                                  ?.label
                              }
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={(e) => handleDelete(index, e)}
                          >
                            <IconsApp.Trash color="#ef4444" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                  {showScrollArrow && (
                    <button
                      type="button"
                      className={styles.scrollIndicator}
                      onClick={scrollToNextSparePart}
                    >
                      <IconsApp.DownArrow />
                    </button>
                  )}
                </div>
              </div>

              <button
                type="button"
                className={styles.addVehicleBtn}
                onClick={goToForm}
              >
                <div className={styles.addIconCircle}>
                  <IconsApp.PlusAddNew />
                </div>
                <span>
                  Agregar {formData.spareParts.length > 0 ? "otro" : "un"}{" "}
                  repuesto
                </span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          ) : (
            /* ===== VISTA 2: FORMULARIO ===== */
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Categoría</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar Categoría</option>
                    {categories.map((c) => (
                      <option key={c.documentId} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Nombre del repuesto</label>
                <div className={styles.selectWrapper}>
                  <select
                    name="partName"
                    value={formData.partName}
                    onChange={handleChange}
                    disabled={!formData.category}
                  >
                    <option value="">
                      {!formData.category
                        ? "Selecciona primero una categoría"
                        : "Seleccionar Repuesto"}
                    </option>

                    {subCategories.map((sub) => (
                      <option key={sub.id} value={sub.name}>
                        {sub.name}
                      </option>
                    ))}
                  </select>
                  <div className={styles.iconOverlay}>
                    <IconsApp.DownArrow />
                  </div>
                </div>
              </div>

              <div className={styles.rowSparParts}>
                <div className={`${styles.field} ${styles.flex2}`}>
                  <label>
                    Referencia / OEM <span className={styles.infoIcon}>?</span>
                  </label>
                  <input
                    type="text"
                    name="oemCode"
                    value={formData.oemCode}
                    onChange={handleChange}
                    placeholder="Opcional"
                    className={styles.input}
                  />
                </div>
                <div className={`${styles.field} ${styles.flex1}`}>
                  <label>Cantidad</label>
                  <div className={styles.quantitySelector}>
                    <button type="button" onClick={() => handleQuantity(-1)}>
                      −
                    </button>
                    <span>{formData.quantity}</span>
                    <button type="button" onClick={() => handleQuantity(1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* AQUÍ ESTÁ LA CONDICIÓN :) */}
              <div className={styles.field}>
                <label>Condición preferida</label>
                <div className={styles.conditionGroup}>
                  {conditions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.conditionBtn} ${
                        formData.condition === c.id
                          ? styles.activeCondition
                          : ""
                      }`}
                      onClick={() => handleCondition(c.id)}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.addVehicleBtn}
                onClick={handleAddSparePart}
                disabled={!formData.partName}
              >
                <div className={styles.addIconCircle}>
                  <IconsApp.PlusAddNew />
                </div>
                <span>Guardar Repuesto</span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          )}
        </StepTransition>
      </div>
    </section>
  );
}
