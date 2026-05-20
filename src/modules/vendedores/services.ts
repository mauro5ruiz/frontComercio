import api from "@/plugins/axios";
import type { Vendedor, CrearVendedorDto } from "./types";

export const obtenerVendedores = async (incluirEliminados = false): Promise<Vendedor[]> => {
  const { data } = await api.get<Vendedor[]>("/vendedores", {
    params: { incluirEliminados }
  });
  return data;
};

export const obtenerVendedorPorId = async (id: number): Promise<Vendedor> => {
  const { data } = await api.get<Vendedor>(`/vendedores/${id}`);
  return data;
};

export const crearVendedor = async (dto: CrearVendedorDto) => {
  await api.post("/vendedores", dto);
};

export const actualizarVendedor = async (id: number, dto: CrearVendedorDto) => {
  await api.put(`/vendedores/${id}`, dto);
};

export const darDeBajaVendedor = async (id: number) => {
  await api.patch(`/vendedores/${id}/baja`);
};

export const restaurarVendedor = async (id: number) => {
  await api.patch(`/vendedores/${id}/restaurar`);
};

export const eliminarVendedorPermanentemente = async (id: number) => {
  await api.delete(`/vendedores/${id}/permanente`);
};
