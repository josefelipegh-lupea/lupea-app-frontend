import { useMemo } from "react";
import { z } from "zod";

const documentsSchema = z.object({
  acta: z.string().min(1, "Obligatorio"),
  asamblea: z.string().min(1, "Obligatorio"),
  rif: z.string().min(1, "Obligatorio"),
  ci: z.string().min(1, "Obligatorio"),
});

export function useDocumentsValidation(files: Record<string, string>) {
  const result = useMemo(() => {
    return documentsSchema.safeParse(files);
  }, [files]);

  return {
    isValid: result.success,
    errors: result.success ? {} : result.error.flatten().fieldErrors,
  };
}
