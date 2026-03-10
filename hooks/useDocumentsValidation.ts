import { documentsSchema } from "@/schemas/stepper/documentsSchema";
import { useMemo } from "react";

export function useDocumentsValidation(files: Record<string, File | null>) {
  const result = useMemo(() => {
    return documentsSchema.safeParse(files);
  }, [files]);

  return {
    isValid: result.success,
    errors: result.success ? {} : result.error.flatten().fieldErrors,
  };
}
