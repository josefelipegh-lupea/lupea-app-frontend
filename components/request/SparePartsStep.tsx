"use client";

import { useEffect, useRef, useState } from "react";
import { IconsApp } from "@/components/icons/Icons";
import styles from "../../app/(dashboard)/home/user/request/Request.module.css";
import StepTransition from "../provider-onboarding/step-transition/StepTransition";
import { Category } from "@/app/lib/api/getCategories";
import { QuoteRequestFormData, SparePart } from "@/hooks/useRequesFormAutoSave";
import Image from "next/image";
import { toast } from "react-hot-toast";
import {
  uploadQuoteItemImage,
  deleteQuoteItemImage,
} from "@/app/lib/api/request/request";

interface SparePartsStepProps {
  formData: QuoteRequestFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteRequestFormData>>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  categories: Category[];
  isCompleted: boolean;
  saveDraft: (data: QuoteRequestFormData) => void;
  jwt: string;
}

export default function SparePartsStep({
  formData,
  setFormData,
  categories,
  isCompleted,
  saveDraft,
  jwt,
}: SparePartsStepProps) {
  const [showForm, setShowForm] = useState(false);
  const [direction, setDirection] = useState(1);
  const cardRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [localPart, setLocalPart] = useState<SparePart>({
    category: "",
    partName: "",
    oemCode: "",
    quantity: 1,
    condition: "no_importa",
    description: "",
  });

  const conditions = [
    { id: "no_importa", label: "Cualquiera" },
    { id: "original", label: "Original" },
    { id: "alternativa", label: "Alternativa" },
    { id: "usado", label: "Usado" },
  ];

  const selectedCategoryObj = categories.find(
    (c) => c.name === localPart.category
  );
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
    resetLocalForm();
    scrollToCard();
  };

  const resetLocalForm = () => {
    setLocalPart({
      category: "",
      partName: "",
      oemCode: "",
      quantity: 1,
      condition: "no_importa",
      description: "",
    });
    setEditingIndex(null);
  };

  // --- Lógica de Imágenes ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !jwt) return;

    try {
      setIsUploading(true);
      const res = await uploadQuoteItemImage(jwt, file);
      setLocalPart((prev) => ({
        ...prev,
        photoId: res.data.image.id,
        photoUrl: res.data.image.url,
      }));
      toast.success("Imagen cargada");
    } catch (error) {
      toast.error("Error al subir imagen");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localPart.photoId || !jwt) return;

    try {
      setIsUploading(true);
      await deleteQuoteItemImage(jwt, localPart.photoId);
      setLocalPart((prev) => ({
        ...prev,
        photoId: undefined,
        photoUrl: undefined,
      }));
      toast.success("Imagen eliminada");
    } catch (error) {
      toast.error("No se pudo eliminar la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Lógica de Edición y Eliminación ---
  const handleDelete = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingIndex(index);

    setTimeout(() => {
      const updatedParts = formData.spareParts.filter((_, i) => i !== index);
      const updatedData = { ...formData, spareParts: updatedParts };
      setFormData(updatedData);
      saveDraft(updatedData);
      setDeletingIndex(null);
    }, 300);
  };

  const handleEdit = (index: number) => {
    const partToEdit = formData.spareParts[index];
    setLocalPart({
      category: partToEdit.category,
      partName: partToEdit.partName,
      oemCode: partToEdit.oemCode || "",
      quantity: partToEdit.quantity,
      condition: partToEdit.condition,
      description: partToEdit.description || "",
      photoId: partToEdit.photoId,
      photoUrl: partToEdit.photoUrl,
    });

    setEditingIndex(index);
    goToForm();
  };

  const handleAddSparePart = () => {
    if (!localPart.partName || !localPart.category) return;

    let updatedParts: SparePart[];

    if (editingIndex !== null) {
      // EDITAR: Creamos una copia de la lista y reemplazamos solo el índice editado
      updatedParts = [...formData.spareParts];
      updatedParts[editingIndex] = { ...localPart };
    } else {
      // NUEVO: Añadimos al final
      updatedParts = [...formData.spareParts, localPart];
    }

    const updatedData: QuoteRequestFormData = {
      ...formData,
      spareParts: updatedParts,
    };

    // Actualizamos el estado global (esto dispara el borrador automáticamente si tienes un useEffect)
    setFormData(updatedData);
    saveDraft(updatedData);

    // Limpiamos y volvemos a la lista
    resetLocalForm();
    goToList();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLSelectElement | HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setLocalPart((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" ? { partName: "" } : {}),
    }));
  };

  const handleQuantity = (val: number) => {
    setLocalPart((prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity + val),
    }));
  };

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
        <h2 className={styles.cardTitle}>Datos del Repuesto</h2>
        {isCompleted && (
          <div className={styles.stepCompletedBadge}>
            <IconsApp.Check />
          </div>
        )}
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
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Repuestos solicitados</label>
                <div className={styles.listWrapper}>
                  <div className={styles.vehicleList} ref={listRef}>
                    {formData.spareParts.length === 0 ? (
                      <div className={styles.noVehicles}>
                        No hay repuestos aún
                      </div>
                    ) : (
                      formData.spareParts.map((part, index) => (
                        <div
                          key={index}
                          className={`${styles.sparePartItem} ${
                            deletingIndex === index ? styles.fadeOut : ""
                          }`}
                        >
                          {part.photoUrl && (
                            <div className={styles.miniPreview}>
                              <Image
                                src={part.photoUrl}
                                alt="part"
                                fill
                                style={{
                                  objectFit: "cover",
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          )}
                          <div
                            className={styles.vehicleInfo}
                            onClick={() => handleEdit(index)}
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
                  {editingIndex !== null
                    ? "Guardar cambios"
                    : `Agregar ${
                        formData.spareParts.length > 0 ? "otro" : "un"
                      } repuesto`}
                </span>
                <IconsApp.RightArrow className={styles.arrowRight} />
              </button>
            </div>
          ) : (
            <div className={styles.subStepContainer}>
              <div className={styles.field}>
                <label>Categoría <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    name="category"
                    value={localPart.category}
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
                <label>Nombre del repuesto <span className={styles.required}>*</span></label>
                <div className={styles.selectWrapper}>
                  <select
                    name="partName"
                    value={localPart.partName}
                    onChange={handleChange}
                    disabled={!localPart.category}
                  >
                    <option value="">
                      {!localPart.category
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
                  <label>Referencia / OEM</label>
                  <input
                    type="text"
                    name="oemCode"
                    value={localPart.oemCode}
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
                    <span>{localPart.quantity}</span>
                    <button type="button" onClick={() => handleQuantity(1)}>
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.field}>
                <label>Condición preferida</label>
                <div className={styles.conditionGroup}>
                  {conditions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`${styles.conditionBtn} ${
                        localPart.condition === c.id
                          ? styles.activeCondition
                          : ""
                      }`}
                      onClick={() =>
                        setLocalPart((p) => ({ ...p, condition: c.id }))
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ===== SECCIÓN DE NOTAS Y FOTO (DISEÑO ORIGINAL REPLICADO) ===== */}

              <div className={styles.field}>
                <label>Foto de referencia (Opcional)</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className={styles.hidden}
                  accept="image/*"
                  disabled={isUploading}
                />

                <div
                  className={`${styles.uploadArea} ${
                    isUploading ? styles.uploading : ""
                  }`}
                  onClick={
                    localPart.photoUrl || isUploading
                      ? undefined
                      : () => fileInputRef.current?.click()
                  }
                >
                  {isUploading ? (
                    <div className={styles.uploadIconCircle}>
                      <span className={styles.loaderSmall} />
                    </div>
                  ) : localPart.photoUrl ? (
                    <div className={styles.thumbnailContainer}>
                      <Image
                        src={localPart.photoUrl}
                        alt="Vista previa"
                        className={styles.thumbnailPreview}
                        fill
                        sizes="250px"
                      />
                      <button
                        className={styles.removePhotoBadge}
                        onClick={handleRemovePhoto}
                        type="button"
                      >
                        <IconsApp.Trash color="#ef4444" />
                      </button>
                    </div>
                  ) : (
                    <div className={styles.uploadIconCircle}>
                      <IconsApp.CameraPlus color="#9CA3AF" />
                    </div>
                  )}

                  <p className={styles.uploadTitle}>
                    {isUploading
                      ? "Subiendo imagen..."
                      : localPart.photoUrl
                      ? "Imagen cargada correctamente"
                      : "Subir foto de referencia"}
                  </p>

                  {!localPart.photoUrl && !isUploading && (
                    <p className={styles.uploadSubtitle}>
                      Ayuda a identificar la pieza exacta
                    </p>
                  )}
                </div>
              </div>

              <div className={`${styles.field} ${styles.fieldSmallMarginTop}`}>
                <label>Notas del repuesto (Opcional)</label>
                <textarea
                  name="description"
                  className={`${styles.textarea} ${styles.textareaMinHeight}`}
                  placeholder="Ej: Lado derecho, compatible con..."
                  value={localPart.description}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                className={`${styles.addVehicleBtn} ${styles.addButtonMarginTop}`}
                onClick={handleAddSparePart}
                disabled={!localPart.partName || isUploading}
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
