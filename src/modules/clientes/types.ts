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
  id: number;
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

enum TipoCliente {
  Persona = 1,
  Empresa = 2
}