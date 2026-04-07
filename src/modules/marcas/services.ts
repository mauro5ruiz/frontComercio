import api from "@/plugins/axios";
import type { Marca, CrearMarcaDTO } from "./types";

const buildFormData = (marca: CrearMarcaDTO) => {
  const formData = new FormData();

  formData.append("nombre", marca.nombre);
  formData.append("activa", String(marca.activa));
  formData.append("eliminarImagen", String(marca.eliminarImagen));

  if (marca.imagen) {
    formData.append("imagen", marca.imagen);
  }

  return formData;
};

// GET todas
export const obtenerMarcas = async (): Promise<Marca[]> => {
  const { data } = await api.get("/marcas");
  return data;
};

// GET por id
export const obtenerMarcaPorId = async (id: number): Promise<Marca> => {
  const { data } = await api.get(`/marcas/${id}`);
  return data;
};

// POST (FormData porque hay imagen)
export const crearMarca = async (marca: CrearMarcaDTO): Promise<Marca> => {
  const { data } = await api.post("/marcas", buildFormData(marca));
  return data;
};

export const actualizarMarca = async (id: number, marca: CrearMarcaDTO): Promise<Marca> => {
  const { data } = await api.put(`/marcas/${id}`, buildFormData(marca));
  return data;
};

// DELETE
export const eliminarMarca = async (id: number) => {
  await api.delete(`/marcas/${id}`);
};