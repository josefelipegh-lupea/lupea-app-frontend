import { z } from "zod";

export const quoteItemSchema = z.object({
  requestItemId: z.number().min(1, "ID de item requerido"),
  offeredBrand: z.string().optional(),
  availableQuantity: z.number().min(1, "La disponibilidad es obligatoria y debe ser al menos 1"),
  unitPrice: z.number().min(0.01, "El precio es obligatorio y debe ser mayor a 0"),
  warranty: z.string().optional(),
  notes: z.string().optional(),
});

export const quoteSubmissionSchema = z.object({
  deliveryTime: z.string().min(1, "Tiempo de entrega es obligatorio"),
  validityDate: z.string().min(1, "Vigencia de cotización es obligatoria"),
  paymentMethods: z.array(z.string()).min(1, "Selecciona al menos una forma de pago"),
  deliveryMethods: z.array(z.string()).min(1, "Selecciona al menos un método de entrega"),
  warrantyPolicy: z.string().optional(),
  returnPolicy: z.string().optional(),
  noteGeneral: z.string().optional(),
  items: z.array(quoteItemSchema).min(1, "Agrega al menos un producto a la cotización"),
}).refine((data) => data.items.every(item => item.unitPrice > 0 && item.availableQuantity >= 1), {
  message: "Completa todos los campos obligatorios",
  path: ["items"],
});

export type QuoteSubmissionValues = z.infer<typeof quoteSubmissionSchema>;
export type QuoteItemValues = z.infer<typeof quoteItemSchema>;