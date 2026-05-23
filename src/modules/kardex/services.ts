import api from "@/plugins/axios";
import type { MovimientoStock } from "./types";

export const obtenerKardex = async (idProducto: number): Promise<MovimientoStock[]> => {
  const { data } = await api.get<MovimientoStock[]>(`/kardex/${idProducto}`);
  return data;
};
