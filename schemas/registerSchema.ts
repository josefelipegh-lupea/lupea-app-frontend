import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(1, "Ingresa un nombre de usuario"),
  email: z
    .string()
    .min(1, "Ingresa tu correo electrónico")
    .email("Correo electrónico inválido"),
  password: z.string().min(1, "Ingresa una contraseña"),
  termsAccepted: z.literal(true, {
    message: "Debes aceptar los términos",
  }),
});

export type RegisterForm = z.infer<typeof registerSchema>;
