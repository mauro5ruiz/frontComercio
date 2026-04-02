import { z } from "zod";

export const categoriaSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .max(50, "Máximo 50 caracteres")
});