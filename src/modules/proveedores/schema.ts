import { z } from "zod";

export const proveedorSchema = z.object({
  razonSocial: z
    .string()
    .min(1, "La razón social es obligatoria")
    .min(3, "Debe tener al menos 3 caracteres")
    .max(150, "Máximo 150 caracteres"),

  cuit: z
    .string()
    .min(1, "El CUIT es obligatorio")
    .regex(/^\d{11}$/, "El CUIT debe contener exactamente 11 dígitos"),

  condicionIva: z
    .string()
    .max(50, "Máximo 50 caracteres")
    .optional(),

  telefono: z
    .string()
    .max(30, "Máximo 30 caracteres")
    .optional(),

  email: z
    .string()
    .email("El email no es válido")
    .max(150, "Máximo 150 caracteres")
    .optional(),

  personaContacto: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional(),

  direccion: z
    .string()
    .max(200, "Máximo 200 caracteres")
    .optional(),

  localidad: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional(),

  provincia: z
    .string()
    .max(100, "Máximo 100 caracteres")
    .optional(),

  codigoPostal: z
    .string()
    .max(20, "Máximo 20 caracteres")
    .optional(),

  observaciones: z
    .string()
    .max(500, "Máximo 500 caracteres")
    .optional(),

  imagen: z
    .any()
    .optional(),

  activo: z
    .boolean()
});