"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { IconsApp } from "@/components/icons/Icons";
import { PageAnimation } from "@/components/page-animation/PageAnimation";
import styles from "./NewQuote.module.css";
import { useFooterVisibility } from "@/context/FooterVisibilityContext";
import { useAuth } from "@/context/AuthContext";
import {
  getProviderRequests,
  ProviderQuoteRequest,
} from "@/app/lib/api/provider/home/request";
import {
  getSalesConditions,
  SalesConditionsData,
  getLogisticsData,
  LogisticsData,
} from "@/app/lib/api/vendor/vendorProfile";
import { submitQuote } from "@/app/lib/api/provider/home/quote";
import { quoteSubmissionSchema } from "@/schemas/quoteSchema";
import toast from "react-hot-toast";
import Header from "@/components/header/Header";
import { SkeletonSendQuote } from "@/components/skeleton/SkeletonSendQuote";

const PAYMENT_METHODS = [
  "Zelle",
  "Pago Móvil",
  "Efectivo",
  "Transferencia",
  "Binance",
];

const DELIVERY_METHODS = ["Retiro en tienda", "Envío local", "Envío nacional"];

const WARRANTY_TYPES = [
  { value: "none", label: "No aplica" },
  { value: "duration", label: "Por tiempo" },
  { value: "until_date", label: "Hasta fecha" },
] as const;

const WARRANTY_DURATION_UNITS = ["días", "meses", "años"] as const;
const DELIVERY_TIME_UNITS = ["horas", "días", "semanas"] as const;

function NewQuotePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const { jwt } = useAuth();
  const { isFooterVisible } = useFooterVisibility();

  const id = searchParams.get("id");

  const [request, setRequest] = useState<ProviderQuoteRequest | null>(null);
  const [salesConditions, setSalesConditions] =
    useState<SalesConditionsData | null>(null);
  const [logistics, setLogistics] = useState<LogisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<
    string[]
  >([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<
    string[]
  >([]);

  const [deliveryTimeMode, setDeliveryTimeMode] = useState<"immediate" | "duration">("duration");
  const [deliveryTimeValue, setDeliveryTimeValue] = useState("");
  const [deliveryTimeUnit, setDeliveryTimeUnit] = useState<(typeof DELIVERY_TIME_UNITS)[number]>("horas");
  const [validityDate, setValidityDate] = useState("");
  const [noteGeneral, setNoteGeneral] = useState("");

  type OfferEntry = {
    unitPrice: string;
    availableQuantity: string;
    warrantyType: (typeof WARRANTY_TYPES)[number]["value"];
    warrantyDurationValue: string;
    warrantyDurationUnit: (typeof WARRANTY_DURATION_UNITS)[number];
    warrantyUntilDate: string;
    notes: string;
    offeredBrand: string;
  };

  const [itemData, setItemData] = useState<Record<number, OfferEntry[]>>({});

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Estado de fotos por oferta: clave `${itemId}_${offerIdx}`
  const [itemPhotos, setItemPhotos] = useState<
    Record<string, { file: File | null; previewUrl: string | null; uploadedId: number | null; uploading: boolean }>
  >({});

  // Refs de los inputs file, indexados por `${itemId}_${offerIdx}`
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!jwt || !id) return;

      try {
        setLoading(true);
        const [requestRes, salesRes, logisticsRes] = await Promise.all([
          getProviderRequests(jwt),
          getSalesConditions(jwt),
          getLogisticsData(jwt),
        ]);

        if (requestRes.ok) {
          const found = requestRes.data.requests.find(
            (r) => r.documentId === id,
          );
          setRequest(found || null);

          if (found) {
            const initialItemData: Record<number, OfferEntry[]> = {};
            found.request.items.forEach((item) => {
              initialItemData[item.id] = [
                {
                  unitPrice: "",
                  availableQuantity: item.quantity.toString(),
                  warrantyType: "none",
                  warrantyDurationValue: "",
                  warrantyDurationUnit: "días",
                  warrantyUntilDate: "",
                  notes: "",
                  offeredBrand: "",
                },
              ];
            });
            setItemData(initialItemData);
          }
        }

        if (salesRes.ok) {
          setSalesConditions(salesRes.data);
          setSelectedPaymentMethods(salesRes.data.paymentMethods || []);
        }

        if (logisticsRes.ok) {
          setLogistics(logisticsRes.data);
          const deliveryMethods: string[] = [];
          if (logisticsRes.data.hasStorePickup) {
            deliveryMethods.push("Retiro en tienda");
          }
          if (logisticsRes.data.hasLocalDelivery) {
            deliveryMethods.push("Envío local");
          }
          if (logisticsRes.data.hasNationalDelivery) {
            deliveryMethods.push("Envío nacional");
          }
          setSelectedDeliveryMethods(deliveryMethods);
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jwt, id]);

  const togglePaymentMethod = (method: string) => {
    setSelectedPaymentMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const toggleDeliveryMethod = (method: string) => {
    setSelectedDeliveryMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const handleItemChange = (itemId: number, offerIdx: number, field: string, value: string) => {
    setItemData((prev) => {
      const offers = [...(prev[itemId] || [])];
      offers[offerIdx] = { ...offers[offerIdx], [field]: value };
      return { ...prev, [itemId]: offers };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[`items.${itemId}.${offerIdx}.${field}`];
      return newErrors;
    });
  };

  const addOffer = (itemId: number, requestedQty: number) => {
    setItemData((prev) => ({
      ...prev,
      [itemId]: [
        ...(prev[itemId] || []),
        {
          unitPrice: "",
          availableQuantity: requestedQty.toString(),
          warrantyType: "none",
          warrantyDurationValue: "",
          warrantyDurationUnit: "días",
          warrantyUntilDate: "",
          notes: "",
          offeredBrand: "",
        },
      ],
    }));
  };

  const buildWarrantyValue = (offer: OfferEntry): string | undefined => {
    if (offer.warrantyType === "none") return "No aplica";
    if (offer.warrantyType === "duration") {
      const value = Number(offer.warrantyDurationValue);
      if (!Number.isFinite(value) || value < 1) return undefined;
      return `${value} ${offer.warrantyDurationUnit}`;
    }
    if (offer.warrantyType === "until_date") {
      return offer.warrantyUntilDate || undefined;
    }
    return undefined;
  };

  const buildDeliveryTimeValue = (): string => {
    if (deliveryTimeMode === "immediate") return "Entrega inmediata";
    const value = Number(deliveryTimeValue);
    if (!Number.isFinite(value) || value < 1) return "";
    return `${value} ${deliveryTimeUnit}`;
  };

  const removeOffer = (itemId: number, offerIdx: number) => {
    setItemData((prev) => {
      const offers = (prev[itemId] || []).filter((_, i) => i !== offerIdx);
      return { ...prev, [itemId]: offers };
    });
    // Reconstruir mapa de fotos renumerando índices tras la eliminación
    setItemPhotos((prev) => {
      const next: typeof prev = {};
      Object.entries(prev).forEach(([key, val]) => {
        const [kItemId, kIdx] = key.split("_").map(Number);
        if (kItemId === itemId) {
          if (kIdx === offerIdx) return; // eliminar la foto de la oferta borrada
          const newIdx = kIdx > offerIdx ? kIdx - 1 : kIdx;
          next[`${kItemId}_${newIdx}`] = val;
        } else {
          next[key] = val;
        }
      });
      return next;
    });
  };

  const handlePhotoSelect = async (itemId: number, offerIdx: number, file: File) => {
    if (!jwt) return;
    const photoKey = `${itemId}_${offerIdx}`;

    // Mostrar preview inmediatamente
    const previewUrl = URL.createObjectURL(file);
    setItemPhotos((prev) => ({
      ...prev,
      [photoKey]: { file, previewUrl, uploadedId: null, uploading: true },
    }));

    try {
      // Subir imagen a Strapi upload
      const formData = new FormData();
      formData.append("files", file);

      const API_BASE = process.env.NEXT_PUBLIC_STRAPI_API_URL?.replace("/api", "") || "http://localhost:1337";
      const res = await fetch(`${API_BASE}/api/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Error al subir la imagen");
      }

      const uploaded = await res.json();
      const uploadedFile = Array.isArray(uploaded) ? uploaded[0] : uploaded;

      setItemPhotos((prev) => ({
        ...prev,
        [photoKey]: { file, previewUrl, uploadedId: uploadedFile.id, uploading: false },
      }));

      toast.success("Foto cargada correctamente");
    } catch {
      toast.error("No se pudo subir la foto");
      setItemPhotos((prev) => ({
        ...prev,
        [photoKey]: { file: null, previewUrl: null, uploadedId: null, uploading: false },
      }));
    }
  };

  const handleSubmitQuote = async () => {
    if (!request || !jwt) return;

    const normalizedDeliveryTime = buildDeliveryTimeValue();

    const items = request.request.items.flatMap((item) => {
      const offers = itemData[item.id] || [];
      return offers.map((offer, offerIdx) => ({
        requestItemId: item.id,
        offeredBrand: offer.offeredBrand || undefined,
        availableQuantity: parseInt(offer.availableQuantity) || undefined,
        unitPrice: parseFloat(offer.unitPrice) || 0,
        warranty: buildWarrantyValue(offer),
        notes: offer.notes || undefined,
        photoId: itemPhotos[`${item.id}_${offerIdx}`]?.uploadedId ?? undefined,
      }));
    });

    const payload = {
      deliveryTime: normalizedDeliveryTime,
      validityDate,
      paymentMethods: selectedPaymentMethods,
      deliveryMethods: selectedDeliveryMethods,
      warrantyPolicy: salesConditions?.warrantyPolicy || undefined,
      returnPolicy: salesConditions?.returnPolicy || undefined,
      noteGeneral: noteGeneral || undefined,
      items,
    };

    const result = quoteSubmissionSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};

      // Validación directa sobre datos locales (más confiable con variantes)
      request.request.items.forEach((item) => {
        const offers = itemData[item.id] || [];
        offers.forEach((offer, offerIdx) => {
          if (!offer.unitPrice || parseFloat(offer.unitPrice) <= 0) {
            fieldErrors[`items.${item.id}.${offerIdx}.unitPrice`] = "El precio es obligatorio";
          }
          if (!offer.availableQuantity || parseInt(offer.availableQuantity) < 1) {
            fieldErrors[`items.${item.id}.${offerIdx}.availableQuantity`] = "La disponibilidad es obligatoria";
          }
          if (!offer.notes || offer.notes.trim().length < 1) {
            fieldErrors[`items.${item.id}.${offerIdx}.notes`] = "La descripcion del producto es obligatoria";
          }
          if (offer.warrantyType === "duration") {
            const value = Number(offer.warrantyDurationValue);
            if (!Number.isFinite(value) || value < 1) {
              fieldErrors[`items.${item.id}.${offerIdx}.warranty`] = "La duracion de garantia debe ser mayor a 0";
            }
          }
          if (offer.warrantyType === "until_date" && !offer.warrantyUntilDate) {
            fieldErrors[`items.${item.id}.${offerIdx}.warranty`] = "Selecciona una fecha de garantia";
          }
        });
      });

      if (deliveryTimeMode === "duration") {
        const parsedDeliveryTime = Number(deliveryTimeValue);
        if (!Number.isFinite(parsedDeliveryTime) || parsedDeliveryTime < 1) {
          fieldErrors["deliveryTime"] = "El tiempo de entrega debe ser mayor a 0";
        }
      }

      // Errores de condiciones comerciales del schema
      result.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        if (!path.startsWith("items")) {
          fieldErrors[path] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Por favor, completa los campos obligatorios");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuote(jwt, id!, "submit", payload);
      if (res.ok) {
        toast.success("Cotización enviada correctamente");
        router.push("/home/vendor/quotes");
      } else {
        toast.error(res.error?.message || "Error al enviar la cotización");
      }
    } catch (error: unknown) {
      if (error instanceof Error) toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageAnimation>
        <div
          className={`${styles.pageWrapper} ${
            !isExpanded ? styles.sidebarCollapsed : ""
          }`}
        >
          <div className={styles.mainContainer}>
            <div className={styles.content}>
              <SkeletonSendQuote />
            </div>
          </div>
        </div>
      </PageAnimation>
    );
  }

  if (!request) {
    return (
      <div>
        <p>Consulta no encontrada</p>
        <button onClick={() => router.push("/home/vendor")}>Volver</button>
      </div>
    );
  }

  const vehicleInfo = `${request.request.vehicle.brand} ${request.request.vehicle.model} ${request.request.vehicle.year}`;
  const clientLocation = [
    request.request.location.exactAddress,
    request.request.location.address,
    request.request.location.name,
    [
      request.request.location.parish,
      request.request.location.municipality,
      request.request.location.state,
    ]
      .filter(Boolean)
      .join(", "),
  ]
    .map((value) => String(value ?? "").trim())
    .find((value) => value.length > 0) ?? "-";

  return (
    <PageAnimation>
      <div
        className={`${styles.pageWrapper} ${
          !isExpanded ? styles.sidebarCollapsed : ""
        }`}
      >
        <main
          className={`${styles.mainContainer} ${
            !isFooterVisible ? styles.noFooter : ""
          }`}
        >
          {/* Header de la solicitud */}
          <div className={styles.topHeaderCard}>
            <button className={styles.backButton} onClick={() => router.back()}>
              <IconsApp.Back color="#000" />
            </button>

            <div className={styles.headerCenter}>
              <div className={styles.headerTitleRow}>
                <h1 className={styles.requestId}>
                  Consulta #{request.id.toString().padStart(5, "0")}
                </h1>
                <span className={styles.badgePending}>
                  {request.status.toUpperCase()}
                </span>
              </div>
              <div className={styles.headerInfo}>
                <div className={styles.infoItem}>
                  <IconsApp.Clock />
                  <span>
                    {new Date(request.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <IconsApp.User />
                  <span>@{request.request.client.username}</span>
                </div>
              </div>
            </div>

            <div className={styles.headerRight}></div>
          </div>

          <div className={styles.content}>
            <div className={styles.subheaderRow}>
              <h2 className={styles.subTitle}>{vehicleInfo}</h2>
              <span className={styles.progressText}>
                {(() => {
                  const total = request.request.items.length;
                  const quoted = request.request.items.filter(
                    (item) => itemData[item.id]?.[0]?.unitPrice,
                  ).length;
                  return `${quoted} de ${total} productos completados`;
                })()}
              </span>
            </div>

            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${
                    (request.request.items.filter(
                      (item) => itemData[item.id]?.[0]?.unitPrice,
                    ).length /
                      request.request.items.length) *
                    100
                  }%`,
                }}
              ></div>
            </div>

            <div className={styles.providerCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.User color="#F08400" />
                </div>
                <h3>Información del cliente</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.providerGrid}>
                <div className={styles.infoGroup}>
                  <label>Nombre Completo</label>
                  <p>{request.request.client.displayName}</p>
                </div>
                <div className={styles.infoGroup}>
                  <label>Ubicación</label>
                  <p>{clientLocation}</p>
                </div>
              </div>
            </div>

            <div className={styles.productsCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#F08400" />
                </div>
                <h3>Productos a cotizar</h3>
              </div>

              <div className={styles.divider}></div>

              {/* Header de la Tabla */}
              <div className={styles.tableHeader}>
                <span className={styles.colProduct}>Producto / Detalle</span>
                <span className={styles.colCant}>Cant.</span>
                <span className={styles.colPrice}>Precio Unitario ($)</span>
                <span className={styles.colStock}>Disp.</span>
                <span className={styles.colWarranty}>Garantía / Descripción</span>
                <span className={styles.colPhoto}>Foto</span>
                <span className={styles.colAddOffer}>Añadir oferta</span>
              </div>

              {/* Filas de Productos */}
              {request.request.items.map((item, index) => {
                const offers = itemData[item.id] || [];
                return (
                <div key={index} className={styles.productRowGroup}>
                  {offers.map((offer, offerIdx) => (
                  <div key={offerIdx} className={`${styles.productRow} ${offerIdx > 0 ? styles.offerVariantRow : ""}`}>
                    {/* Columna producto: solo en la primera oferta */}
                    {offerIdx === 0 ? (
                    <div
                      className={styles.colProduct}
                      data-label="Producto / Detalle"
                    >
                      <div className={styles.productInfoWrapper}>
                        <div className={styles.gearIcon}>
                          <IconsApp.Gear />
                        </div>
                        <div className={styles.nameContent}>
                          <p className={styles.prodName}>{item.productName}</p>
                          <p className={styles.prodSub}>
                            {request.request.vehicle.brand}{" "}
                            {request.request.vehicle.model}{" "}
                            {request.request.vehicle.year} •{" "}
                            {item.conditionPreferred === "no_importa"
                              ? "Cualquiera"
                              : item.conditionPreferred}
                          </p>
                        </div>
                      </div>
                    </div>
                    ) : (
                    <div className={styles.colProductPlaceholder} />
                  )}
                  <div className={styles.quickFields}>
                    <div className={styles.colCant} data-label="Cant.">
                      <span className={styles.cantValue}>{item.quantity}</span>
                    </div>
                    <div className={styles.colPrice} data-label="Precio Unitario ($)">
                      <input
                        type="text"
                        placeholder="0"
                        className={`${styles.smallInput} ${errors[`items.${item.id}.${offerIdx}.unitPrice`] ? styles.inputError : ""}`}
                        value={offer.unitPrice}
                        onChange={(e) =>
                          handleItemChange(item.id, offerIdx, "unitPrice", e.target.value)
                        }
                      />
                    </div>
                    <div className={styles.colStock} data-label="Disponibilidad">
                      <div className={styles.offeredInputWrapper}>
                        <input
                          type="number"
                          min="1"
                          className={`${styles.smallInput} ${errors[`items.${item.id}.${offerIdx}.availableQuantity`] ? styles.inputError : ""}`}
                          value={offer.availableQuantity}
                          onChange={(e) =>
                            handleItemChange(item.id, offerIdx, "availableQuantity", e.target.value)
                          }
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            if (!value || value < 1) {
                              handleItemChange(item.id, offerIdx, "availableQuantity", "1");
                            }
                          }}
                        />
                        <button
                          type="button"
                          className={styles.resetQtyBtn}
                          onClick={() =>
                            handleItemChange(item.id, offerIdx, "availableQuantity", item.quantity.toString())
                          }
                          title="Restablecer a cantidad solicitada"
                        >
                          ↺
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={styles.colWarranty} data-label="Garantía / Descripción">
                    <div className={styles.obsContainer}>
                      <label className={styles.warrantyLabel}>Garantía</label>
                      <div className={styles.inlinePillGroup}>
                        {WARRANTY_TYPES.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`${styles.inlinePill} ${offer.warrantyType === option.value ? styles.inlinePillActive : ""}`}
                            onClick={() => {
                              handleItemChange(item.id, offerIdx, "warrantyType", option.value);
                              setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors[`items.${item.id}.${offerIdx}.warranty`];
                                return newErrors;
                              });
                            }}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                      <div className={styles.dynamicSlot}>
                        <div
                          className={`${styles.dynamicPanel} ${offer.warrantyType === "duration" ? styles.dynamicPanelActive : ""}`}
                        >
                          <div className={styles.inlineInputRow}>
                            <input
                              type="number"
                              min="1"
                              placeholder="Tiempo"
                              className={`${styles.smallInput} ${errors[`items.${item.id}.${offerIdx}.warranty`] ? styles.inputError : ""}`}
                              value={offer.warrantyDurationValue}
                              onChange={(e) =>
                                handleItemChange(item.id, offerIdx, "warrantyDurationValue", e.target.value)
                              }
                              disabled={offer.warrantyType !== "duration"}
                              tabIndex={offer.warrantyType === "duration" ? 0 : -1}
                            />
                            <select
                              className={styles.smallSelect}
                              value={offer.warrantyDurationUnit}
                              onChange={(e) =>
                                handleItemChange(item.id, offerIdx, "warrantyDurationUnit", e.target.value)
                              }
                              disabled={offer.warrantyType !== "duration"}
                              tabIndex={offer.warrantyType === "duration" ? 0 : -1}
                            >
                              {WARRANTY_DURATION_UNITS.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div
                          className={`${styles.dynamicPanel} ${offer.warrantyType === "until_date" ? styles.dynamicPanelActive : ""}`}
                        >
                          <input
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            className={`${styles.smallInput} ${errors[`items.${item.id}.${offerIdx}.warranty`] ? styles.inputError : ""}`}
                            value={offer.warrantyUntilDate}
                            onChange={(e) =>
                              handleItemChange(item.id, offerIdx, "warrantyUntilDate", e.target.value)
                            }
                            disabled={offer.warrantyType !== "until_date"}
                            tabIndex={offer.warrantyType === "until_date" ? 0 : -1}
                          />
                        </div>
                      </div>
                      <div className={styles.errorSlot}>
                        {errors[`items.${item.id}.${offerIdx}.warranty`] && (
                          <span className={styles.errorText}>{errors[`items.${item.id}.${offerIdx}.warranty`]}</span>
                        )}
                      </div>
                      <label className={styles.requiredNotesLabel}>Descripción del producto</label>
                      <textarea
                        placeholder="Ej: Marca, referencia, material u otros detalles relevantes"
                        className={`${styles.notesTextarea} ${errors[`items.${item.id}.${offerIdx}.notes`] ? styles.inputError : ""}`}
                        value={offer.notes}
                        onChange={(e) =>
                          handleItemChange(item.id, offerIdx, "notes", e.target.value)
                        }
                        rows={3}
                      />
                      {errors[`items.${item.id}.${offerIdx}.notes`] && (
                        <span className={styles.errorText}>{errors[`items.${item.id}.${offerIdx}.notes`]}</span>
                      )}
                    </div>
                  </div>

                  <div className={styles.colPhoto} data-label="Foto">
                    <input
                      type="file"
                      accept="image/*"
                      className={styles.hiddenInput}
                      ref={(el) => {
                        fileInputRefs.current[`${item.id}_${offerIdx}`] = el;
                      }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoSelect(item.id, offerIdx, file);
                      }}
                    />
                    <button
                      type="button"
                      className={styles.photoCircle}
                      onClick={() => fileInputRefs.current[`${item.id}_${offerIdx}`]?.click()}
                      title="Subir foto del producto"
                      disabled={itemPhotos[`${item.id}_${offerIdx}`]?.uploading}
                    >
                      {itemPhotos[`${item.id}_${offerIdx}`]?.previewUrl ? (
                        <img
                          src={itemPhotos[`${item.id}_${offerIdx}`].previewUrl!}
                          alt="preview"
                          className={styles.photoPreview}
                        />
                      ) : itemPhotos[`${item.id}_${offerIdx}`]?.uploading ? (
                        <span className={styles.uploadingText}>...</span>
                      ) : (
                        <IconsApp.Camera />
                      )}
                    </button>
                  </div>

                  {/* Columna + Oferta: botón en última variante, eliminar en extras */}
                  <div className={styles.colAddOffer} data-label="Añadir oferta">
                    {offerIdx === offers.length - 1 ? (
                      <button
                        type="button"
                        className={styles.addOfferBtn}
                        onClick={() => addOffer(item.id, item.quantity)}
                        title="Añadir otra oferta para este producto"
                      >
                        <IconsApp.PlusAddNew />
                        <span>Oferta</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.removeOfferBtn}
                        onClick={() => removeOffer(item.id, offerIdx)}
                        title="Eliminar esta oferta"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
                  ))}
                </div>
                );
              })}
            </div>

            <div className={styles.commercialCard}>
              <div className={styles.cardHeaderTitle}>
                <div className={styles.iconCircle}>
                  <IconsApp.Document color="#F08400" />
                </div>
                <h3>Condiciones comerciales</h3>
              </div>

              <div className={styles.divider}></div>

              <div className={styles.commercialGrid}>
                {/* Columna Izquierda: Pagos y Entrega */}
                <div className={styles.commercialCol}>
                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Formas de pago aceptadas
                    </label>
                    <div
                      className={`${styles.pillContainer} ${errors["paymentMethods"] ? styles.pillErrorContainer : ""}`}
                    >
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`${styles.pillButton} ${
                            selectedPaymentMethods.includes(method)
                              ? styles.active
                              : ""
                          }`}
                          onClick={() => {
                            togglePaymentMethod(method);
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["paymentMethods"];
                              return newErrors;
                            });
                          }}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                    {errors["paymentMethods"] && (
                      <span className={styles.errorText}>
                        {errors["paymentMethods"]}
                      </span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.requiredLabel}>
                      Métodos de entrega
                    </label>
                    <div
                      className={`${styles.pillContainer} ${errors["deliveryMethods"] ? styles.pillErrorContainer : ""}`}
                    >
                      {DELIVERY_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          className={`${styles.pillButton} ${
                            selectedDeliveryMethods.includes(method)
                              ? styles.active
                              : ""
                          }`}
                          onClick={() => {
                            toggleDeliveryMethod(method);
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["deliveryMethods"];
                              return newErrors;
                            });
                          }}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                    {errors["deliveryMethods"] && (
                      <span className={styles.errorText}>
                        {errors["deliveryMethods"]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Tiempos, Fecha y Notas */}
                <div className={styles.commercialCol}>
                  <div className={styles.rowInputs}>
                    <div className={styles.inputSubGroup}>
                      <label className={styles.requiredLabel}>Tiempo entrega estimado</label>
                      <div className={styles.modeToggleRow}>
                        <button
                          type="button"
                          className={`${styles.inlinePill} ${deliveryTimeMode === "immediate" ? styles.inlinePillActive : ""}`}
                          onClick={() => {
                            setDeliveryTimeMode("immediate");
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["deliveryTime"];
                              return newErrors;
                            });
                          }}
                        >
                          Entrega inmediata
                        </button>
                        <button
                          type="button"
                          className={`${styles.inlinePill} ${deliveryTimeMode === "duration" ? styles.inlinePillActive : ""}`}
                          onClick={() => {
                            setDeliveryTimeMode("duration");
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["deliveryTime"];
                              return newErrors;
                            });
                          }}
                        >
                          Por tiempo
                        </button>
                      </div>
                      <div className={styles.dynamicSlot}>
                        <div
                          className={`${styles.dynamicPanel} ${deliveryTimeMode === "duration" ? styles.dynamicPanelActive : ""}`}
                        >
                          <div className={styles.inlineInputRow}>
                            <input
                              type="number"
                              min="1"
                              placeholder="Cantidad"
                              className={`${styles.smallInput} ${errors["deliveryTime"] ? styles.inputError : ""}`}
                              value={deliveryTimeValue}
                              onChange={(e) => {
                                setDeliveryTimeValue(e.target.value);
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors["deliveryTime"];
                                  return newErrors;
                                });
                              }}
                              disabled={deliveryTimeMode !== "duration"}
                              tabIndex={deliveryTimeMode === "duration" ? 0 : -1}
                            />
                            <select
                              className={styles.smallSelect}
                              value={deliveryTimeUnit}
                              onChange={(e) => {
                                setDeliveryTimeUnit(e.target.value as (typeof DELIVERY_TIME_UNITS)[number]);
                                setErrors((prev) => {
                                  const newErrors = { ...prev };
                                  delete newErrors["deliveryTime"];
                                  return newErrors;
                                });
                              }}
                              disabled={deliveryTimeMode !== "duration"}
                              tabIndex={deliveryTimeMode === "duration" ? 0 : -1}
                            >
                              {DELIVERY_TIME_UNITS.map((unit) => (
                                <option key={unit} value={unit}>
                                  {unit}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className={styles.errorSlot}>
                        {errors["deliveryTime"] && (
                          <span className={styles.errorText}>{errors["deliveryTime"]}</span>
                        )}
                      </div>
                    </div>

                    <div className={styles.inputSubGroup}>
                      <label className={styles.requiredLabel}>Vigencia cotización</label>
                      <div className={styles.dateInputWrapper}>
                        <input
                          type="date"
                          className={`${styles.smallInput} ${errors["validityDate"] ? styles.inputError : ""}`}
                          min={new Date().toISOString().split("T")[0]}
                          value={validityDate}
                          onChange={(e) => {
                            setValidityDate(e.target.value);
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors["validityDate"];
                              return newErrors;
                            });
                          }}
                        />
                        <div className={styles.calendarIconPointer}>
                          <IconsApp.Calendar />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className={styles.inputSubGroup}
                    style={{ marginTop: "20px" }}
                  >
                    <label>Notas generales (opcional)</label>
                    <textarea
                      placeholder="Condiciones adicionales, restricciones..."
                      className={styles.textAreaField}
                      value={noteGeneral}
                      onChange={(e) => setNoteGeneral(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.stickyFooterAction}>
            <div className={styles.footerLeft}>
              <div className={styles.subtotalGroup}>
                <label>SUBTOTAL ESTIMADO</label>
                <span className={styles.subtotalValue}>
                  $
                  {request.request.items
                    .reduce((total, item) => {
                      const offers = itemData[item.id] || [];
                      const itemTotal = offers.reduce((sum, offer) => {
                        const price = parseFloat(offer.unitPrice) || 0;
                        const qty = parseInt(offer.availableQuantity) || 0;
                        return sum + price * qty;
                      }, 0);
                      return total + itemTotal;
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>

              <div className={styles.dividerVertical} />

              <div
                className={`${styles.warningBadge}${
                  request.request.items.every(
                    (item) => itemData[item.id]?.[0]?.unitPrice,
                  )
                    ? ` ${styles.warningBadgeSuccess}`
                    : ""
                }`}
              >
                {(() => {
                  const missingCount = request.request.items.filter(
                    (item) => !itemData[item.id]?.[0]?.unitPrice,
                  ).length;

                  if (missingCount === 0) {
                    return (
                      <>
                        <IconsApp.Check
                          color="#22c55e"
                          width="16"
                          height="16"
                        />
                        <span className={styles.successText}>
                          Todos los productos cotizados
                        </span>
                      </>
                    );
                  }

                  return (
                    <>
                      <IconsApp.Warning
                        color="#F08400"
                        width="16"
                        height="16"
                      />
                      <span>Faltan {missingCount} productos por cotizar</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div className={styles.footerRight}>
              <button
                className={styles.btnCancel}
                onClick={() => router.back()}
              >
                Cancelar
              </button>
              <button className={styles.btnSave}>
                <IconsApp.Save />
                Guardar borrador
              </button>
              <button
                className={styles.btnSubmit}
                onClick={handleSubmitQuote}
                disabled={submitting}
              >
                {submitting ? "Enviando..." : "Enviar cotización"}
                <IconsApp.Send />
              </button>
            </div>
          </div>
        </main>
      </div>
    </PageAnimation>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense
      fallback={
        <PageAnimation>
          <div className={styles.pageWrapper}>
            <div className={styles.mainContainer}>
              <div className={styles.content}>
                <SkeletonSendQuote />
              </div>
            </div>
          </div>
        </PageAnimation>
      }
    >
      <NewQuotePageContent />
    </Suspense>
  );
}
