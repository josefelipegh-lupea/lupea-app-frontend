import { ProviderFormData } from "@/components/provider-onboarding/types";
import { commercialSchema } from "@/schemas/stepper/commercialSchema";
import { useMemo } from "react";

export function useCommercialValidation(values: ProviderFormData) {
  const result = useMemo(() => {
    return commercialSchema.safeParse(values);
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
