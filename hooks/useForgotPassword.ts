import {
  forgotPasswordSchema,
  ForgotPasswordValues,
} from "@/schemas/forgot-password";
import { useMemo } from "react";

export function useForgotPasswordValidation(values: ForgotPasswordValues) {
  const result = useMemo(() => {
    return forgotPasswordSchema.safeParse(values);
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
