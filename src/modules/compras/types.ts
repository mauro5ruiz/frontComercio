export interface DetalleCompra {
  id?: number;
  idCompra?: number;
  idProducto: number;
  cantidad: number;
  cantidadDevuelta?: number;
  precioUnitario: number;
  subtotal?: number;
}

export interface CompraPago {
  id?: number;
  idCompra?: number;
  idFormaPago: number;
  importe: number;
  referencia?: string;
  fechaPago?: string;
  estado?: number;
}

export interface Compra {
  id: number;
  numeroComprobante: string;
  fecha: string;
  idProveedor: number;
  idSucursal: number;
  total: number;
  totalPagado: number;
  saldoPendiente: number;
  estado: number;
  observaciones?: string;
  fechaAnulacion?: string | null;
  detalles?: DetalleCompra[];
  pagos?: CompraPago[];
}

export interface CrearCompraDTO {
  numeroComprobante: string;
  idProveedor: number;
  idSucursal: number;
  observaciones?: string;
  detalles: DetalleCompra[];
  pagos?: CompraPago[];
}

export interface PagarCompraDTO {
  idCompra: number;
  importe: number;
  idFormaPago: number;
}
