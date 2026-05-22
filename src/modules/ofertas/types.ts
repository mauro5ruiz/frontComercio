export enum TipoDescuento {
  Porcentaje = 1,
  Fijo = 2,
  PrecioFinal = 3
}

export interface Oferta {
  id: number;
  idProducto: number;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

export interface CrearOfertaDto {
  idProducto: number;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
}
