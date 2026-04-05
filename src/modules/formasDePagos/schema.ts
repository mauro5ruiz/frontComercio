import { z } from "zod";

export const formaDePagoSchema = z.object({
  nombre: z
    .string()
    .min(1, "El nombre es obligatorio")
    .min(3, "Debe tener al menos 3 caracteres")
    .max(20, "Máximo 20 caracteres")
});