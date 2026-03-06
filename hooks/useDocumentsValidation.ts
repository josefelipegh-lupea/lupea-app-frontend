import { useMemo } from "react";
import { z } from "zod";

const documentsSchema = z.object({
  registry: z.instanceof(File, { message: "El Acta es obligatoria" }),
  assembly: z.instanceof(File, {
    message: "El Acta de Asamblea es obligatoria",
  }),
  rif: z.instanceof(File, { message: "El RIF es obligatorio" }),
  legal_id: z.instanceof(File, { message: "La CI es obligatoria" }),
});

export function useDocumentsValidation(files: Record<string, File | null>) {
  const result = useMemo(() => {
    return documentsSchema.safeParse(files);
  }, [files]);

  return {
    isValid: result.success,
    errors: result.success ? {} : result.error.flatten().fieldErrors,
  };
}
