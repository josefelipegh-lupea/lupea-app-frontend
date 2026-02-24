import { z } from "zod";

export const forgotPasswordSchema = z.object({
  email: z.string().email("Correo electrónico inválido"),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
