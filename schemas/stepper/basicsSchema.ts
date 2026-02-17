import { z } from "zod";

export const basicsSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  email: z.string().email("Introduce un correo electrónico válido"),
  business_name: z.string().min(2, "La razón social es obligatoria"),
  phone: z
    .string()
    .min(11, "El número es demasiado corto")
    .regex(/^\+?[0-9\s\-]+$/, "Formato de teléfono no válido"),
});
