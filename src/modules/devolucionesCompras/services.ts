import api from "@/plugins/axios";
import type {
  CrearDevolucionCompraDto,
  CrearDevolucionCompraResponse,
  DevolucionCompra,
  DevolucionCompraDetalle,
  PagoDevolucionCompra,
} from "./types";

export async function obtenerDevolucionesComprasEntreFechas(desde: string, hasta: string): Promise<DevolucionCompra[]> {
  const { data } = await api.get("/devoluciones-compras", { params: { desde, hasta } });
  return normalizarLista(data);
}

export async function obtenerDevolucionCompraPorId(id: number): Promise<DevolucionCompra> {
  const { data } = await api.get(`/devoluciones-compras/${id}`);
  return normalizarDevolucion(data);
}

export async function crearDevolucionCompra(dto: CrearDevolucionCompraDto): Promise<CrearDevolucionCompraResponse> {
  const { data } = await api.post("/devoluciones-compras", dto);
  return data;
}

function normalizarLista(payload: unknown): DevolucionCompra[] {
  if (!Array.isArray(payload)) return [];
  return payload.map(normalizarDevolucion);
}

function normalizarDevolucion(payload: any): DevolucionCompra {
  return {
    id: payload.id ?? payload.Id,
    idCompra: payload.idCompra ?? payload.IdCompra,
    idProveedor: payload.idProveedor ?? payload.IdProveedor,
    fecha: payload.fecha ?? payload.Fecha,
    motivo: payload.motivo ?? payload.Motivo ?? null,
    total: payload.total ?? payload.Total ?? 0,
    estado: payload.estado ?? payload.Estado ?? 0,
    detalles: normalizarDetalles(payload.detalles ?? payload.Detalles),
    pagos: normalizarPagos(payload.pagos ?? payload.Pagos),
  };
}

function normalizarDetalles(payload: unknown): DevolucionCompraDetalle[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idDevolucionCompra: item.idDevolucionCompra ?? item.IdDevolucionCompra,
    idProducto: item.idProducto ?? item.IdProducto,
    cantidad: item.cantidad ?? item.Cantidad ?? 0,
    precioUnitario: item.precioUnitario ?? item.PrecioUnitario ?? 0,
    subtotal: item.subtotal ?? item.Subtotal ?? 0,
  }));
}

function normalizarPagos(payload: unknown): PagoDevolucionCompra[] {
  if (!Array.isArray(payload)) return [];

  return payload.map((item: any) => ({
    id: item.id ?? item.Id,
    idDevolucionCompra: item.idDevolucionCompra ?? item.IdDevolucionCompra,
    idFormaPago: item.idFormaPago ?? item.IdFormaPago,
    importe: item.importe ?? item.Importe ?? 0,
    referencia: item.referencia ?? item.Referencia,
  }));
}
