export interface Vendedor {
  id: number;
  nombre: string;
  apellido: string;
  nroDni: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  fechaNacimiento?: string | null;
  activo: boolean;
  fechaAlta: string;
  fechaEliminado?: string | null;
  observaciones?: string | null;
  idSucursal: number;
}

export interface CrearVendedorDto {
  nombre: string;
  apellido: string;
  nroDni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento?: string | null;
  observaciones?: string;
  activo: boolean;
}
