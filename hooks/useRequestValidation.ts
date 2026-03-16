import { FormData } from "@/app/(dashboard)/home/user/request/page";
import { requestSchema } from "@/schemas/requestSchema";
import { useMemo } from "react";
import { QuoteRequestFormData } from "./useRequesFormAutoSave";

export function useRequestValidation(values: QuoteRequestFormData) {
  const result = useMemo(() => {
    return requestSchema.safeParse(values);
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
