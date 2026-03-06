import { ProviderFormData } from "@/components/provider-onboarding/types";
import { useMemo } from "react";
import { z } from "zod";

const commercialSchema = z.object({
  paymentMethods: z
    .array(z.string())
    .min(1, { message: "Debes seleccionar al menos un método de pago" }),
  warrantyPolicy: z.string().optional().or(z.literal("")),
  returnPolicy: z.string().optional().or(z.literal("")),
  hasStorePickup: z.boolean(),
  hasLocalDelivery: z.boolean(),
  hasNationalDelivery: z.boolean(),
  shippingCarriers: z.array(z.string()),
});

export function useCommercialValidation(values: ProviderFormData) {
  const result = useMemo(() => {
    return commercialSchema.safeParse(values);
  }, [values]);

  const errors = useMemo(() => {
    if (result.success) return {};
    return result.error.flatten().fieldErrors;
  }, [result]);

  return {
    isValid: result.success,
    errors,
  };
}
