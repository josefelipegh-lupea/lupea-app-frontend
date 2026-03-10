import z from "zod";

const entitySchema = z.object({
  id: z.number(),
  documentId: z.string().optional(),
  name: z.string().optional(),
});

export const classificationSchema = z.object({
  mainCategories: z
    .array(entitySchema)
    .min(1, "Selecciona al menos una categoría"),
  brands: z.array(entitySchema).min(1, "Selecciona al menos una marca"),
});
