import { loginSchema } from "@/schemas/loginSchema";
import { useMemo } from "react";

interface FormValues {
  email: string;
  password: string;
}

export function useLoginValidation(values: FormValues) {
  const result = useMemo(() => {
    return loginSchema.safeParse(values);
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
