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