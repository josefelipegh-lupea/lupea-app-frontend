import { useMemo } from "react";
import { LocationValues } from "@/app/lib/api/client/location";
import { locationSchema } from "@/schemas/stepper/locationSchema";

export function useLocationValidation(values: LocationValues | null) {
  const result = useMemo(() => {
    if (!values) return { success: false, error: null };
    return locationSchema.safeParse(values);
  }, [values]);

  const errors = useMemo(() => {
    if (!result.success) {
      return result.error?.flatten().fieldErrors || {};
    }
    return {};
  }, [result]);

  return {
    isValid: result.success,
    errors,
  };
}
