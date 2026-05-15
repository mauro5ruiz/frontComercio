import { z } from "zod";

export const detalleCompraSchema = z.object({
  idProducto: z.number().int().positive("El producto es obligatorio"),
  cantidad: z.number().positive("La cantidad debe ser mayor a 0"),
  precioUnitario: z.number().positive("El precio unitario debe ser mayor a 0"),
});

export const compraPagoSchema = z.object({
  idFormaPago: z.number().int().positive("La forma de pago es obligatoria"),
  importe: z.number().positive("El importe debe ser mayor a 0"),
  referencia: z.string().max(120, "Máximo 120 caracteres").optional(),
});

export const crearCompraSchema = z.object({
  numeroComprobante: z.string().min(1, "El número de comprobante es obligatorio").max(40, "Máximo 40 caracteres"),
  idProveedor: z.number().int().positive("El proveedor es obligatorio"),
  idSucursal: z.number().int().positive("La sucursal es obligatoria"),
  observaciones: z.string().max(500, "Máximo 500 caracteres").optional(),
  detalles: z.array(detalleCompraSchema).min(1, "Debe agregar al menos un detalle"),
  pagos: z.array(compraPagoSchema).optional(),
});

export const pagarProveedorSchema = z.object({
  idProveedor: z.number().int().positive("El proveedor es obligatorio"),
  importe: z.number().positive("El importe debe ser mayor a 0"),
  idFormaPago: z.number().int().positive("La forma de pago es obligatoria"),
});

