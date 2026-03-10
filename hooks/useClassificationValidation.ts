import { useMemo } from "react";
import { BaseEntity } from "@/app/lib/api/vendor/vendorProfile";
import { classificationSchema } from "@/schemas/stepper/classificationSchema";

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
