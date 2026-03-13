import {
  ProviderRegisterForm,
  providerRegisterSchema,
} from "@/schemas/registerProviderSchema";
import { useMemo } from "react";

export function useProviderRegisterValidation(values: ProviderRegisterForm) {
  // Evaluamos el esquema con los valores actuales
  const result = useMemo(() => {
    return providerRegisterSchema.safeParse(values);
  }, [values]);

  // Extraemos los errores de forma aplanada (fieldErrors)
  const errors = useMemo(() => {
    if (result.success) return {};
    return result.error.flatten().fieldErrors;
  }, [result]);

  return {
    isValid: result.success,
    errors,
  };
}
