import { useMemo } from "react";
import { profileSchema, ProfileValues } from "@/schemas/profileSchema";

export function useProfileValidation(values: ProfileValues) {
  const result = useMemo(() => {
    return profileSchema.safeParse(values);
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
