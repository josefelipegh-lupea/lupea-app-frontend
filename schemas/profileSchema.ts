import { z } from "zod";

const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
const venezuelaPhoneRegex = /^\+58\d{10}$/;

export const profileSchema = z.object({
  displayName: z.string().min(2, "El nombre a mostrar es muy corto"),
  firstName: z
    .string()
    .min(2, "El nombre es obligatorio")
    .regex(nameRegex, "El nombre no puede contener números ni símbolos"),
  lastName: z
    .string()
    .min(2, "El apellido es obligatorio")
    .regex(nameRegex, "El apellido no puede contener números ni símbolos"),
  username: z.string().min(3, "El usuario es obligatorio"),
  email: z.string().trim().email("Correo electrónico no válido"),
  phone: z
    .string()
    .regex(
      venezuelaPhoneRegex,
      "Formato inválido. Debe ser +58 seguido de 10 dígitos (ej: +584121234567)"
    ),
});

export type ProfileValues = z.infer<typeof profileSchema>;
