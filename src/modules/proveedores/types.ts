export interface Proveedor {
  id: number;
  razonSocial: string;
  cuit: string;
  condicionIva?: string;
  telefono?: string;
  email?: string;
  personaContacto?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  observaciones?: string;
  activo: boolean;
  urlImagen?: string;
  fechaCreacion: string; // ISO string
  fechaBaja?: string | null;
}

export interface CrearProveedorDTO {
  razonSocial: string;
  cuit: string;
  condicionIva?: string;
  telefono?: string;
  email?: string;
  personaContacto?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  observaciones?: string;
  imagen?: File | null;
  activo: boolean;
}

export interface ActualizarProveedorDTO {
  razonSocial?: string;
  cuit?: string;
  condicionIva?: string;
  telefono?: string;
  email?: string;
  personaContacto?: string;
  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;
  observaciones?: string;
  imagen?: File | null;
  eliminarImagen?: boolean;
  activo?: boolean;
}

export interface ObtenerCuentaCorrienteQuery {
  desde?: string;
  hasta?: string;
  soloPendientes?: boolean;
}

export interface ProveedorCompraPendiente {
  idCompra: number;
  fecha: string;
  comprobante: string;
  total: number;
  pagado: number;
  saldoPendiente: number;
}

export interface ProveedorMovimiento {
  tipo: string;
  idCompra?: number | null;
  idPago?: number | null;
  fecha: string;
  comprobante: string;
  formaPago?: string | null;
  referencia?: string | null;
  importe: number;
  totalCompra?: number | null;
  pagadoCompra?: number | null;
  saldoPendienteCompra?: number | null;
}

export interface ProveedorCuentaCorriente {
  idProveedor: number;
  proveedor: string;
  saldoTotalPendiente: number;
  totalComprado: number;
  totalPagado: number;
  comprasPendientes: ProveedorCompraPendiente[];
  movimientos: ProveedorMovimiento[];
}

export interface PagarProveedorDTO {
  idProveedor: number;
  importe: number;
  idFormaPago: number;
}
