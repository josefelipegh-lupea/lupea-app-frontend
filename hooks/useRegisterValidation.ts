import { registerSchema } from "@/schemas/registerSchema";
import { useMemo } from "react";

interface FormValues {
  username: string;
  email: string;
  password: string;
  termsAccepted: boolean;
}

export function useRegisterValidation(values: FormValues) {
  const result = useMemo(() => {
    return registerSchema.safeParse(values);
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
