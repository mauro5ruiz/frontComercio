import { z } from "zod";

export const marcaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .max(100, "Máximo 100 caracteres"),

  imagen: z
    .any()
    .optional(),

  activa: z
    .boolean()
});