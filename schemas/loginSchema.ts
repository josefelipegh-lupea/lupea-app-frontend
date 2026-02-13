import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo electrónico o username"),
  password: z.string().min(1, "Ingresa una contraseña"),
});

export type LoginForm = z.infer<typeof loginSchema>;
