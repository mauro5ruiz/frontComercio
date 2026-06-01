import api from "@/plugins/axios";
import type { Compra, CompraPago, CrearCompraDTO, DetalleCompra, PagarCompraDTO } from "./types";

export const obtenerComprasEntreFechas = async (desde: string, hasta: string): Promise<Compra[]> => {
  const { data } = await api.get("/compras", { params: { desde, hasta } });
  return normalizarCompras(data);
};

export const obtenerComprasPorEstado = async (idEstado: number): Promise<Compra[]> => {
  const { data } = await api.get("/compras/estado", { params: { idEstado } });
  return normalizarCompras(data);
};

export const obtenerCompraPorId = async (id: number): Promise<Compra> => {
  const { data } = await api.get(`/compras/${id}`);
  return normalizarCompra(data);
};

export const crearCompra = async (dto: CrearCompraDTO): Promise<{ mensaje: string; idCompra: number }> => {
  const { data } = await api.post("/compras", dto);
  return data;
};

export const anularCompra = async (id: number): Promise<{ mensaje: string }> => {
  const { data } = await api.put(`/compras/anular/${id}`);
  return data;
};

export const pagarCompra = async (dto: PagarCompraDTO): Promise<{ mensaje: string }> => {
  const { data } = await api.post("/compras/pagar", dto);
  return data;
};

function normalizarCompras(payload: unknown): Compra[] {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizarCompra);
}

function normalizarCompra(payload: any): Compra {
  return {
    id: payload.id ?? payload.Id,
    numeroComprobante: payload.numeroComprobante ?? payload.NumeroComprobante ?? "",
    fecha: payload.fecha ?? payload.Fecha ?? "",
    idProveedor: payload.idProveedor ?? payload.IdProveedor ?? 0,
    idSucursal: payload.idSucursal ?? payload.IdSucursal ?? 0,
    total: payload.total ?? payload.Total ?? 0,
    totalPagado: payload.totalPagado ?? payload.TotalPagado ?? 0,
    saldoPendiente: payload.saldoPendiente ?? payload.SaldoPendiente ?? 0,
    estado: payload.estado ?? payload.Estado ?? 0,
    observaciones: payload.observaciones ?? payload.Observaciones,
    fechaAnulacion: payload.fechaAnulacion ?? payload.FechaAnulacion ?? null,
    detalles: normalizarDetalles(payload.detalles ?? payload.Detalles),
    pagos: normalizarPagos(payload.pagos ?? payload.Pagos),
  };
}

function normalizarDetalles(payload: unknown): DetalleCompra[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idCompra: item.idCompra ?? item.IdCompra,
    idProducto: item.idProducto ?? item.IdProducto ?? 0,
    cantidad: item.cantidad ?? item.Cantidad ?? 0,
    cantidadDevuelta: item.cantidadDevuelta ?? item.CantidadDevuelta ?? 0,
    precioUnitario: item.precioUnitario ?? item.PrecioUnitario ?? 0,
    subtotal: item.subtotal ?? item.Subtotal ?? 0,
  }));
}

function normalizarPagos(payload: unknown): CompraPago[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idCompra: item.idCompra ?? item.IdCompra,
    idFormaPago: item.idFormaPago ?? item.IdFormaPago ?? 0,
    importe: item.importe ?? item.Importe ?? 0,
    referencia: item.referencia ?? item.Referencia,
    fechaPago: item.fechaPago ?? item.FechaPago,
    estado: item.estado ?? item.Estado,
  }));
}
