import api from "@/plugins/axios";
import type { Categoria, CrearCategoriaDTO } from "./types";

export const obtenerCategorias = async (): Promise<Categoria[]> => {
  const { data } = await api.get("/categorias");
  return data;
};

export const crearCategoria = async (categoria: CrearCategoriaDTO) => {
  const { data } = await api.post("/categorias", categoria);
  return data;
};

export const eliminarCategoria = async (id: number) => {
  await api.delete(`/categorias/${id}`);
};

export const actualizarCategoria = async (id: number, categoria: CrearCategoriaDTO): Promise<Categoria> => {
  const { data } = await api.put(`/categorias/${id}`, categoria);
  return data;
};