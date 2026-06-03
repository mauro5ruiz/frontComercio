import api from "@/plugins/axios";
import type {
  CrearDevolucionVentaDto,
  CrearDevolucionVentaResponse,
  DevolucionVenta,
  DevolucionVentaDetalle,
  PagoDevolucionVenta,
} from "./types";

export async function obtenerDevolucionesVentasEntreFechas(desde: string, hasta: string): Promise<DevolucionVenta[]> {
  const { data } = await api.get("/devoluciones-ventas", { params: { desde, hasta } });
  return normalizarLista(data);
}

export async function obtenerDevolucionVentaPorId(id: number): Promise<DevolucionVenta> {
  const { data } = await api.get(`/devoluciones-ventas/${id}`);
  return normalizarDevolucion(data);
}

export async function crearDevolucionVenta(dto: CrearDevolucionVentaDto): Promise<CrearDevolucionVentaResponse> {
  const { data } = await api.post("/devoluciones-ventas", dto);
  return data;
}

function normalizarLista(payload: unknown): DevolucionVenta[] {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizarDevolucion);
}

function normalizarDevolucion(payload: any): DevolucionVenta {
  return {
    id: payload.id ?? payload.Id,
    idVenta: payload.idVenta ?? payload.IdVenta,
    numeroComprobante: payload.numeroComprobante ?? payload.NumeroComprobante ?? null,
    fecha: payload.fecha ?? payload.Fecha,
    idCliente: payload.idCliente ?? payload.IdCliente,
    total: payload.total ?? payload.Total ?? 0,
    observaciones: payload.observaciones ?? payload.Observaciones ?? null,
    estado: payload.estado ?? payload.Estado ?? null,
    detalles: normalizarDetalles(payload.detalles ?? payload.Detalles),
    pagos: normalizarPagos(payload.pagos ?? payload.Pagos),
  };
}

function normalizarDetalles(payload: unknown): DevolucionVentaDetalle[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idDevolucionVenta: item.idDevolucionVenta ?? item.IdDevolucionVenta,
    idVentaDetalle: item.idVentaDetalle ?? item.IdVentaDetalle,
    idProducto: item.idProducto ?? item.IdProducto,
    cantidad: item.cantidad ?? item.Cantidad ?? 0,
    precioUnitario: item.precioUnitario ?? item.PrecioUnitario ?? 0,
    subtotal: item.subtotal ?? item.Subtotal ?? 0,
  }));
}

function normalizarPagos(payload: unknown): PagoDevolucionVenta[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idDevolucionVenta: item.idDevolucionVenta ?? item.IdDevolucionVenta,
    idFormaPago: item.idFormaPago ?? item.IdFormaPago,
    importe: item.importe ?? item.Importe ?? 0,
    referencia: item.referencia ?? item.Referencia,
    fechaPago: item.fechaPago ?? item.FechaPago,
    estado: item.estado ?? item.Estado ?? null,
  }));
}
