import { useMemo } from "react";
import { z } from "zod";

// Definimos el esquema aquí o impórtalo si ya lo tienes
const basicsSchema = z.object({
  username: z.string().min(3, "Mínimo 3 caracteres"),
  email: z.string().email("Correo inválido"),
  business_name: z.string().min(2, "Razón social obligatoria"),
  phone: z.string().min(10, "Número inválido"),
});

export function useBasicsValidation(values: {
  username: string;
  email: string;
  business_name: string;
  phone: string;
}) {
  const result = useMemo(() => {
    return basicsSchema.safeParse(values);
  }, [values]);

  const errors = useMemo(() => {
    if (result.success) return {};
    // Flatten devuelve { fieldErrors: { username: ["..."], email: ["..."] } }
    return result.error.flatten().fieldErrors;
  }, [result]);

  return {
    isValid: result.success,
    errors,
  };
}
