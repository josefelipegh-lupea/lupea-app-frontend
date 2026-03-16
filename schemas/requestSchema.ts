import { z } from "zod";

export const DELIVERY_METHODS = ["retiro", "delivery"] as const;

// Esquema para un repuesto individual
const sparePartSchema = z.object({
  category: z.string().min(1, "La categoría es obligatoria"),
  partName: z.string().min(1, "El nombre del repuesto es obligatorio"),
  oemCode: z.string().optional(),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1"),
  condition: z.string().min(1, "Selecciona una condición"),
});

export const requestSchema = z.object({
  // Datos del Vehículo
  userVehicle: z.string().min(1, "Debes seleccionar un vehículo"),
  brand: z.string().min(1, "Marca requerida"),
  model: z.string().min(1, "Modelo requerido"),
  year: z.number().min(1900).max(2027),
  engine: z.string().min(1, "Motor requerido"),
  version: z.string().optional(),

  // Datos de Entrega
  deliveryCity: z.string().min(1, "Debes seleccionar una ubicación"),
  deliveryMethod: z.enum(DELIVERY_METHODS, {
    message: "Selecciona un método de entrega válido",
  }),

  // Listado de Repuestos (El array que importa ahora)
  spareParts: z.array(sparePartSchema).min(1, "Agrega al menos un repuesto"),

  extraInfo: z.string().optional(),
});

export type RequestValues = z.infer<typeof requestSchema>;
