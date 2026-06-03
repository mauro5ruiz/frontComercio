import api from "@/plugins/axios";
import type { CobrarClienteDTO, CrearVentaDTO, Venta } from "./types";

export const obtenerVentasEntreFechas = async (desde: string, hasta: string): Promise<Venta[]> => {
  const { data } = await api.get("/ventas", { params: { desde, hasta } });
  return data;
};

export const obtenerVentasPorEstado = async (idEstado: number): Promise<Venta[]> => {
  const { data } = await api.get("/ventas/estado", { params: { idEstado } });
  return data;
};

export const obtenerVentaPorId = async (id: number): Promise<Venta> => {
  const { data } = await api.get(`/ventas/${id}`);
  return data;
};

export const crearVenta = async (dto: CrearVentaDTO): Promise<{ mensaje: string; idVenta: number }> => {
  const { data } = await api.post("/ventas", dto);
  return data;
};

export const anularVenta = async (id: number): Promise<{ mensaje: string }> => {
  const { data } = await api.put(`/ventas/anular/${id}`);
  return data;
};

export const obtenerPendientesPorCliente = async (idCliente: number): Promise<Venta[]> => {
  const { data } = await api.get(`/ventas/pendientes/cliente/${idCliente}`);
  return data;
};

export const cobrarCliente = async (dto: CobrarClienteDTO): Promise<{ mensaje: string }> => {
  const { data } = await api.post("/ventas/cobrar", dto);
  return data;
};
