import z from "zod";

export const commercialSchema = z
  .object({
    paymentMethods: z
      .array(z.string())
      .min(1, { message: "Debes seleccionar al menos un método de pago" }),
    warrantyPolicy: z.string().optional().or(z.literal("")),
    returnPolicy: z.string().optional().or(z.literal("")),
    hasStorePickup: z.boolean(),
    hasLocalDelivery: z.boolean(),
    hasNationalDelivery: z.boolean(),
    nationalCarriers: z.array(z.string()),
  })
  .refine(
    (data) =>
      data.hasStorePickup || data.hasLocalDelivery || data.hasNationalDelivery,
    {
      message: "Debes seleccionar al menos un método de entrega",
      path: ["hasStorePickup"],
    }
  );
