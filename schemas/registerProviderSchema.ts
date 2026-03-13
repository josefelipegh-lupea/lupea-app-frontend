import { z } from "zod";

export const providerRegisterSchema = z.object({
  username: z
    .string()
    .min(1, "Ingresa un nombre de usuario")
    .regex(/^\S*$/, "El nombre de usuario no puede tener espacios"),
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa una contraseña"),
  // Validamos que el array tenga al menos 1 número
  mainCategories: z
    .array(z.number())
    .min(1, "Selecciona al menos una categoría principal"),
  subcategories: z
    .array(z.number())
    .min(1, "Selecciona al menos una subcategoría"),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos",
  }),
});

export type ProviderRegisterForm = z.infer<typeof providerRegisterSchema>;
