import z from "zod";

export const documentsSchema = z.object({
  registry: z.instanceof(File, { message: "El Acta es obligatoria" }),
  assembly: z.instanceof(File, {
    message: "El Acta de Asamblea es obligatoria",
  }),
  rif: z.instanceof(File, { message: "El RIF es obligatorio" }),
  legal_id: z.instanceof(File, { message: "La CI es obligatoria" }),
});
