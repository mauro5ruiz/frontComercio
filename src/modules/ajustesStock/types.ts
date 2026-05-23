export interface AjustesStockDto {
  idProducto: number;
  stockReal: number;
  motivo: string;
}

export interface AjusteStockLecturaDto {
  idProducto: number;
  producto: string;
  idTipoMovimientoStock: number;
  cantidad: number;
  idReferencia: number;
  fecha: string;
  observaciones: string;
}
