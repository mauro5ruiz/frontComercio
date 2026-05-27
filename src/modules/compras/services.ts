import api from "@/plugins/axios";
import type { Compra, CrearCompraDTO } from "./types";

export const obtenerComprasEntreFechas = async (desde: string, hasta: string): Promise<Compra[]> => {
  const { data } = await api.get("/compras", { params: { desde, hasta } });
  return data;
};

export const obtenerCompraPorId = async (id: number): Promise<Compra> => {
  const { data } = await api.get(`/compras/${id}`);
  return data;
};

export const crearCompra = async (dto: CrearCompraDTO): Promise<{ mensaje: string; idCompra: number }> => {
  const { data } = await api.post("/compras", dto);
  return data;
};

export const anularCompra = async (id: number): Promise<{ mensaje: string }> => {
  const { data } = await api.put(`/compras/anular/${id}`);
  return data;
};
