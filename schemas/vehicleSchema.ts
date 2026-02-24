import { z } from "zod";

export const vehicleSchema = z.object({
  brand: z.string().min(2, "La marca es obligatoria"),
  model: z.string().min(1, "El modelo es obligatorio"),
  year: z.coerce
    .number()
    .min(1950, "Año no válido")
    .max(new Date().getFullYear() + 1, "El año no puede ser tan avanzado"),
  version: z.string().min(1, "La versión es obligatoria"),
  engine: z.string().min(1, "El motor es obligatorio"),
});

export type VehicleValues = z.infer<typeof vehicleSchema>;
