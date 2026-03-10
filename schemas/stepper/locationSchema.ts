import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(3, "El nombre de la sede es muy corto"),
  type: z.string().min(1),
  state: z.string().min(1, "El estado es obligatorio"),
  municipality: z.string().min(1, "El municipio es obligatorio"),
  parish: z.string().min(1, "La parroquia es obligatoria"),
  address: z.string().min(5, "La ubicación en el mapa no es válida"),
  exactAddress: z.string().min(3, "Indique algún punto de referencia"),
  latitude: z.number().refine((n) => n !== 0, "Coordenadas inválidas"),
  longitude: z.number().refine((n) => n !== 0, "Coordenadas inválidas"),
  placeId: z.string().min(1, "Debe ubicar un punto en el mapa"),
});
