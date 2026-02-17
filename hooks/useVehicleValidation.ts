import { useMemo } from "react";
import { z } from "zod";

export const useVehicleValidation = (vehicle: {
  brand: string;
  model: string;
  year: string;
  version: string;
  engine: string;
}) => {
  const isFormValid = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const vehicleSchema = z.object({
      brand: z.string().min(1),
      model: z.string().min(1),

      year: z
        .string()
        .length(4)
        .refine((val) => {
          const yearNum = parseInt(val);
          return yearNum <= currentYear;
        }),
      version: z.string().min(1),
      engine: z.string().min(1),
    });

    const result = vehicleSchema.safeParse(vehicle);
    return result.success;
  }, [vehicle]);

  return { isFormValid };
};
