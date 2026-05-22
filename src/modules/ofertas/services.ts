import api from "@/plugins/axios";
import type { CrearOfertaDto, Oferta } from "./types";

export const obtenerOfertas = async (incluirVencidas = false): Promise<Oferta[]> => {
  const { data } = await api.get<Oferta[]>("/ofertas", {
    params: { incluirVencidas }
  });
  return data;
};

export const obtenerOfertaPorId = async (id: number): Promise<Oferta> => {
  const { data } = await api.get<Oferta>(`/ofertas/${id}`);
  return data;
};

export const crearOferta = async (dto: CrearOfertaDto) => {
  const { data } = await api.post("/ofertas", dto);
  return data;
};

export const actualizarOferta = async (id: number, dto: CrearOfertaDto) => {
  await api.put(`/ofertas/${id}`, dto);
};

export const desactivarOfertaPorProducto = async (productoId: number) => {
  await api.patch(`/ofertas/desactivar/${productoId}`);
};
