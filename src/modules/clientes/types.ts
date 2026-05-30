export interface Cliente {
  id: number;
  tipoCliente: number; // 1 = Persona | 2 = Empresa

  nombre?: string;
  apellido?: string;
  razonSocial?: string;

  nroDocumento?: string;
  cuit?: string;
  nroTelefono?: string;
  email?: string;

  urlImagen?: string;

  fechaAlta: string; // ISO string
  fechaBaja?: string | null;

  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;

  condicionIva?: string;
  observaciones?: string;

  activo: boolean;

  nombreCompleto: string; // viene calculado del backend
}

export interface CrearClienteDTO {
  tipoCliente: number;

  nombre?: string;
  apellido?: string;
  razonSocial?: string;

  nroDocumento?: string;
  cuit?: string;
  nroTelefono?: string;
  email?: string;

  imagen?: File | null;

  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;

  condicionIva?: string;
  observaciones?: string;

  activo: boolean;
}

export interface ActualizarClienteDTO {
  id?: number;
  tipoCliente?: number;

  nombre?: string;
  apellido?: string;
  razonSocial?: string;

  nroDocumento?: string;
  cuit?: string;
  nroTelefono?: string;
  email?: string;

  imagen?: File | null;
  eliminarImagen?: boolean; // recomendado agregarlo si manejás borrado

  direccion?: string;
  localidad?: string;
  provincia?: string;
  codigoPostal?: string;

  condicionIva?: string;
  observaciones?: string;

  activo?: boolean;
}

export interface ObtenerCuentaCorrienteClienteQuery {
  desde?: string;
  hasta?: string;
  soloPendientes?: boolean;
}

export interface ClienteVentaPendiente {
  idVenta: number;
  fecha: string;
  comprobante: string;
  total: number;
  cobrado: number;
  saldoPendiente: number;
}

export interface ClienteMovimiento {
  tipo: string;
  idVenta?: number | null;
  idCobro?: number | null;
  idDevolucionVenta?: number | null;
  fecha: string;
  comprobante: string;
  formaPago?: string | null;
  referencia?: string | null;
  importe: number;
  saldoCredito?: number | null;
  totalVenta?: number | null;
  cobradoVenta?: number | null;
  saldoPendienteVenta?: number | null;
}

export interface ClienteCuentaCorriente {
  idCliente: number;
  cliente: string;
  saldoTotalPendiente: number;
  creditoDisponible: number;
  saldoNeto: number;
  totalVendido: number;
  totalCobrado: number;
  ventasPendientes: ClienteVentaPendiente[];
  movimientos: ClienteMovimiento[];
}

export interface CobrarCuentaCorrienteClienteDTO {
  idCliente: number;
  importe: number;
  idFormaPago: number;
  referencia?: string;
}

enum TipoCliente {
  Persona = 1,
  Empresa = 2
}
