import { basicsSchema } from "@/schemas/stepper/basicsSchema";
import { useMemo } from "react";

export function useBasicsValidation(values: {
  username: string;
  email: string;
  businessName: string;
  phoneNumber: string;
}) {
  const result = useMemo(() => {
    return basicsSchema.safeParse(values);
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
