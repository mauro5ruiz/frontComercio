export interface DetalleVenta {
  id?: number;
  idVenta?: number;
  idProducto: number;
  cantidad: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface VentaPago {
  id?: number;
  idVenta?: number;
  idFormaPago: number;
  importe: number;
  cuotas?: number;
  referencia?: string;
  fechaPago?: string;
  estado?: string;
}

export interface Venta {
  id: number;
  numeroComprobante: string;
  fecha: string;
  idCliente: number;
  idVendedor: number;
  idSucursal: number;
  total: number;
  totalPagado: number;
  saldoPendiente: number;
  estado: string | number;
  observaciones?: string;
  fechaAnulacion?: string | null;
  detalles?: DetalleVenta[];
  pagos?: VentaPago[];
}

export interface CrearVentaDTO {
  numeroComprobante: string;
  idCliente: number;
  idVendedor: number;
  idSucursal: number;
  observaciones?: string;
  detalles: DetalleVenta[];
  pagos?: VentaPago[];
}

export interface CobrarClienteDTO {
  idCliente: number;
  importe: number;
  idFormaPago: number;
  referencia: string;
}

export interface AnularVentaPagoDTO {
  idFormaPago: number;
  importe: number;
  referencia?: string;
}

export interface AnularVentaDTO {
  pagos?: AnularVentaPagoDTO[];
}
