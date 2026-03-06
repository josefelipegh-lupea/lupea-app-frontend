import { useMemo } from "react";
import { z } from "zod";

const basicsSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Correo inválido"),
  businessName: z.string().min(2, "Razón social obligatoria"),
  phone: z.string().min(13, "Número inválido"),
});

export function useBasicsValidation(values: {
  username: string;
  email: string;
  businessName: string;
  phone: string;
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
