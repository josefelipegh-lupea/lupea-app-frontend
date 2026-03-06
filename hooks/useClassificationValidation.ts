import { useMemo } from "react";
import { z } from "zod";
import { BaseEntity } from "@/app/lib/api/vendor/vendorProfile";

// Esquema que valida un objeto con ID numérico
const entitySchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  name: z.string().optional(),
});

const classificationSchema = z.object({
  mainCategories: z
    .array(entitySchema)
    .min(1, "Selecciona al menos una categoría"),
  brands: z.array(entitySchema).min(1, "Selecciona al menos una marca"),
});

// Tipamos los valores de entrada estrictamente
interface ClassificationValues {
  mainCategories: BaseEntity[];
  brands: BaseEntity[];
}

export function useClassificationValidation(values: ClassificationValues) {
  const result = useMemo(() => {
    return classificationSchema.safeParse(values);
  }, [values]);

  const errors = useMemo(() => {
    if (result.success) return {};
    return result.error.flatten().fieldErrors;
  }, [result]);

  return {
    isValid: result.success,
    errors,
  };
}
