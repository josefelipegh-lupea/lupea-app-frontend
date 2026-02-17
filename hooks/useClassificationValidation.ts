import { useMemo } from "react";
import { z } from "zod";

const classificationSchema = z.object({
  categories: z.array(z.string()).min(1, "Agrega al menos una categoría"),
  brands: z.array(z.string()).min(1, "Agrega al menos una marca"),
});

export function useClassificationValidation(values: {
  categories: string[];
  brands: string[];
}) {
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
