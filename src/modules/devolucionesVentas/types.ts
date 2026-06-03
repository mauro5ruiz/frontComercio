export interface DevolucionVentaDetalle {
  id?: number;
  idDevolucionVenta?: number;
  idVentaDetalle: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PagoDevolucionVenta {
  id?: number;
  idDevolucionVenta?: number;
  idFormaPago: number;
  importe: number;
  referencia?: string;
  fechaPago?: string;
  estado?: string | number | null;
}

export interface DevolucionVenta {
  id: number;
  idVenta: number;
  numeroComprobante?: string | null;
  fecha: string;
  idCliente: number;
  total: number;
  observaciones?: string | null;
  estado?: string | number | null;
  detalles?: DevolucionVentaDetalle[];
  pagos?: PagoDevolucionVenta[];
}

export interface CrearDevolucionVentaDetalleDto {
  idVentaDetalle: number;
  idProducto: number;
  cantidad: number;
}

export interface CrearPagoDevolucionVentaDto {
  idFormaPago: number;
  importe: number;
  referencia?: string;
}

export interface CrearDevolucionVentaDto {
  idVenta: number;
  numeroComprobante?: string;
  idCliente: number;
  observaciones?: string;
  detalles: CrearDevolucionVentaDetalleDto[];
  pagos?: CrearPagoDevolucionVentaDto[];
}

export interface CrearDevolucionVentaResponse {
  mensaje?: string;
  Mensaje?: string;
  idDevolucion?: number;
  IdDevolucion?: number;
}
