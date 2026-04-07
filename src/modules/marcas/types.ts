export interface Marca {
  id: number;
  nombre: string;
  imagen?: string;
  activa: boolean;
}

export interface CrearMarcaDTO {
  nombre: string;
  imagen?: File | null;
  activa: boolean;
  eliminarImagen: boolean;
}