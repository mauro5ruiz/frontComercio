import api from "@/plugins/axios";
import type {
  Producto,
  ActualizacionPrecioIndividualDto,
  ActualizacionPrecioMasivaDto
} from "./types";

export const obtenerProductos = async (incluirEliminados = false): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>("/productos", {
    params: { incluirEliminados }
  });
  return data;
};

export const obtenerProductoPorId = async (id: number): Promise<Producto> => {
  const { data } = await api.get<Producto>(`/productos/${id}`);
  return data;
};

export const crearProducto = async (formData: FormData) => {
  await api.post("/productos", formData);
};

export const actualizarProducto = async (id: number, formData: FormData) => {
  await api.patch(`/productos/${id}`, formData);
};

export const eliminarProducto = async (id: number) => {
  await api.delete(`/productos/${id}`);
};

export const darDeBajaProducto = async (id: number) => {
  await api.patch(`/productos/${id}/baja`);
};

export const restaurarProducto = async (id: number) => {
  await api.patch(`/productos/${id}/restauracion`);
};

export const obtenerProductosBajoStock = async (): Promise<Producto[]> => {
  const { data } = await api.get<Producto[]>("/productos/bajo-stock");
  return data;
};

export const actualizarPrecioIndividual = async (id: number, dto: ActualizacionPrecioIndividualDto) => {
  await api.patch(`/productos/${id}/precio`, dto);
};

export const actualizarPreciosMasivos = async (dto: ActualizacionPrecioMasivaDto): Promise<number> => {
  const { data } = await api.patch("/productos/precios", dto);
  return data?.registrosAfectados ?? 0;
};
