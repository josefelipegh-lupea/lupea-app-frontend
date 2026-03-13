import { z } from "zod";

export const basicsSchema = z.object({
  username: z
    .string()
    .min(3, "El usuario debe tener al menos 3 caracteres")
    .regex(/^[a-zA-Z0-9_.\s]+$/, "Solo letras, números y guiones bajos"),
  email: z
    .string()
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Introduce un correo electrónico válido"
    ),
  businessName: z.string().min(2, "La razón social es obligatoria"),
  phoneNumber: z
    .string()
    .min(13, "El número es demasiado corto")
    .max(14, "Formato de teléfono no válido")
    .regex(/^\+[0-9]+$/, "Formato de teléfono no válido"),
});
