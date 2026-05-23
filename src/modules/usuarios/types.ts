export interface UsuarioDto {
  id: number;
  nombreCompleto: string;
  email: string;
  usuarioLogin: string;
  rol: string;
  rolId?: number;
  claveHash?: string;
  sucursal?: string | null;
  activo: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string | null;
}

export interface CrearUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  usuarioLogin: string;
  clave: string;
  rolId: number;
  telefono?: string | null;
  debeCambiarClave: boolean;
  activo: boolean;
}

export interface ActualizarUsuarioDto {
  nombre: string;
  apellido: string;
  email: string;
  usuarioLogin: string;
  clave?: string;
  rolId: number;
  telefono?: string | null;
  debeCambiarClave: boolean;
  activo: boolean;
}

export interface CambiarClaveDto {
  usuarioId: number;
  claveActual: string;
  nuevaClave: string;
}

export interface LoginDto {
  usuario: string;
  clave: string;
}
