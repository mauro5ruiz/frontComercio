export interface DevolucionCompraDetalle {
  id?: number;
  idDevolucionCompra?: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface PagoDevolucionCompra {
  id?: number;
  idDevolucionCompra?: number;
  idFormaPago: number;
  importe: number;
  referencia?: string;
}

export interface DevolucionCompra {
  id: number;
  idCompra: number;
  idProveedor: number;
  fecha: string;
  motivo?: string | null;
  total: number;
  estado: number;
  detalles?: DevolucionCompraDetalle[];
  pagos?: PagoDevolucionCompra[];
}

export interface CrearDevolucionCompraDetalleDto {
  idProducto: number;
  cantidad: number;
}

export interface CrearPagoDevolucionCompraDto {
  idFormaPago: number;
  importe: number;
}

export interface CrearDevolucionCompraDto {
  idCompra: number;
  idProveedor: number;
  motivo?: string;
  detalles: CrearDevolucionCompraDetalleDto[];
  pagos?: CrearPagoDevolucionCompraDto[];
}

export interface CrearDevolucionCompraResponse {
  mensaje?: string;
  Mensaje?: string;
  idDevolucion?: number;
  IdDevolucion?: number;
}
