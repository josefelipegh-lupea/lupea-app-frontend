import { useState, useCallback } from "react";
import { useRequestValidation } from "./useRequestValidation";

const STORAGE_KEY = "quote_request_draft";

export interface SparePart {
  category: string;
  partName: string;
  oemCode?: string;
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
        return {
          ...initialData,
          ...parsed,
          spareParts: Array.isArray(parsed.spareParts) ? parsed.spareParts : [],
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
