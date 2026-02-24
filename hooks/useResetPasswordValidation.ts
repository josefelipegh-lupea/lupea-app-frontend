import { useMemo } from "react";
import {
  resetPasswordSchema,
  ResetPasswordValues,
} from "@/schemas/resetPasswordSchema";

export function useResetPasswordValidation(values: ResetPasswordValues) {
  const result = useMemo(() => {
    return resetPasswordSchema.safeParse(values);
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
