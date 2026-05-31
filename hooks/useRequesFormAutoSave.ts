import { useState, useCallback } from "react";
import { useRequestValidation } from "./useRequestValidation";

const STORAGE_KEY = "quote_request_draft";

export interface SparePart {
  category: string;
  subcategory: string;
  partName: string;
  quantity: number;
  condition: string;
  description?: string;
  photoId?: number;
  photoUrl?: string;
}

export interface QuoteRequestFormData {
  userVehicle?: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  version: string;
  deliveryCity: string;
  deliveryMethod: string;
  extraInfo: string;
  spareParts: SparePart[];
  photo: File | null;
  photoUrl?: string;
  photoId?: number;
}

export function useRequestForm(initialData: QuoteRequestFormData) {
  const [formData, setFormData] = useState<QuoteRequestFormData>(() => {
    if (typeof window === "undefined") return initialData;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const normalizedSpareParts = Array.isArray(parsed.spareParts)
          ? parsed.spareParts.map((part: any) => ({
              category: part?.category ?? "",
              subcategory: part?.subcategory ?? part?.partName ?? "",
              partName: part?.partName ?? "",
              quantity: Number(part?.quantity) > 0 ? Number(part.quantity) : 1,
              condition: part?.condition ?? "no_importa",
              description: part?.description,
              photoId: part?.photoId,
              photoUrl: part?.photoUrl,
            }))
          : [];

        return {
          ...initialData,
          ...parsed,
          spareParts: normalizedSpareParts,
          photo: null,
        };
      } catch (e) {
        return initialData;
      }
    }
    return initialData;
  });

  const saveDraft = useCallback((data: QuoteRequestFormData) => {
    const { photo, photoUrl, ...rest } = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  }, []);

  const { isValid, errors } = useRequestValidation(formData);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { formData, setFormData, isValid, errors, clearDraft, saveDraft };
}
