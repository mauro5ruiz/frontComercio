import { z } from "zod";


// helper opcional limpio
const optionalString = (schema: z.ZodString) =>
  z.preprocess(
    (val) => (val === "" ? undefined : val),
    schema.optional()
  );

export const clienteSchema = z.object({
  tipoCliente: z
  .number()
  .refine((val) => val === 1 || val === 2, {
    message: "Debe seleccionar un tipo de cliente válido"
  }),

  nombre: optionalString(
    z.string().min(2, "El nombre debe tener al menos 2 caracteres")
  ),

  apellido: optionalString(
    z.string().min(2, "El apellido debe tener al menos 2 caracteres")
  ),

  razonSocial: optionalString(
    z.string().min(2, "La razón social debe tener al menos 2 caracteres")
  ),

  cuit: optionalString(
    z
      .string()
      .regex(/^\d{11}$/, "El CUIT debe tener exactamente 11 números")
  ),

  nroDocumento: optionalString(
    z
      .string()
      .min(5, "El documento debe tener al menos 5 caracteres")
      .max(20, "El documento no puede superar los 20 caracteres")
  ),

  nroTelefono: optionalString(
    z.string().max(30, "El teléfono no puede superar los 30 caracteres")
  ),

  email: optionalString(
    z
      .string()
      .email("El email no es válido")
      .max(150, "El email no puede superar los 150 caracteres")
  ),

  imagen: z.any().optional(),

  direccion: optionalString(
    z.string().max(200, "La dirección no puede superar los 200 caracteres")
  ),

  localidad: optionalString(
    z.string().max(100, "La localidad no puede superar los 100 caracteres")
  ),

  provincia: optionalString(
    z.string().max(100, "La provincia no puede superar los 100 caracteres")
  ),

  codigoPostal: optionalString(
    z.string().max(20, "El código postal no puede superar los 20 caracteres")
  ),

  condicionIva: optionalString(
    z.string().max(50, "La condición de IVA no puede superar los 50 caracteres")
  ),

  observaciones: optionalString(
    z.string().max(500, "Las observaciones no pueden superar los 500 caracteres")
  ),

  activo: z.boolean()
})
.superRefine((data, ctx) => {
  if (data.tipoCliente === 1) {
    if (!data.nombre || data.nombre.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["nombre"],
        message: "El nombre es obligatorio para personas"
      });
    }

    if (!data.apellido || data.apellido.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["apellido"],
        message: "El apellido es obligatorio para personas"
      });
    }
  }

  if (data.tipoCliente === 2) {
    if (!data.razonSocial || data.razonSocial.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["razonSocial"],
        message: "La razón social es obligatoria para empresas"
      });
    }

    if (!data.cuit || data.cuit.trim() === "") {
      ctx.addIssue({
        code: "custom",
        path: ["cuit"],
        message: "El CUIT es obligatorio para empresas"
      });
    }
  }
});