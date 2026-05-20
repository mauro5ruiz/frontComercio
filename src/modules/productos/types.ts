export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  codigoBarra?: string;
  idCategoria?: number;
  categoria: string;
  idMarca?: number;
  marca: string;
  precioCompra?: number;
  precioVenta: number;
  stockMinimo?: number;
  stockActual: number;
  controlStock: boolean;
  activo: boolean;
  previewImagen?: string | null;
}

export interface ActualizacionPrecioIndividualDto {
  valor: number;
  tipoOperacion: number;
}

export interface ActualizacionPrecioMasivaDto {
  valor: number;
  tipoOperacion: number;
  idCategoria: number | null;
  idMarca: number | null;
  soloActivos: boolean;
}
