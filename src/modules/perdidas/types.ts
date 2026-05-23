export enum EstadoPerdida {
  Pendiente = 1,
  Confirmada = 2,
  Anulada = 3
}

export interface DetallePerdida {
  id: number;
  idPerdida: number;
  idProducto: number;
  cantidad: number;
}

export interface Perdida {
  id: number;
  fecha: string;
  motivo: string;
  observacion: string;
  idUsuario: number;
  idEstado: number;
  detalles: DetallePerdida[];
}

export interface DetallePerdidaDto {
  idProducto: number;
  cantidad: number;
}

export interface CrearPerdidaDto {
  fecha: string;
  motivo: string;
  observacion: string;
  idUsuario: number;
  idEstado: number;
  detalles: DetallePerdidaDto[];
}

export interface ActualizarPerdidaDto {
  motivo: string;
  observacion: string;
}
