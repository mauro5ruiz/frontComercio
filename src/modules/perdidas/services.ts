import api from "@/plugins/axios";
import type {
  ActualizarPerdidaDto,
  CrearPerdidaDto,
  DetallePerdida,
  Perdida
} from "./types";

export const obtenerPerdidasEntreFechas = async (desde: string, hasta: string): Promise<Perdida[]> => {
  const { data } = await api.get<Perdida[]>("/perdidias", {
    params: { desde, hasta }
  });
  return data;
};

export const obtenerPerdidaPorId = async (id: number): Promise<Perdida> => {
  const { data } = await api.get<Perdida>(`/perdidias/${id}`);
  return data;
};

export const crearPerdida = async (dto: CrearPerdidaDto): Promise<{ mensaje?: string; idPerdida: number }> => {
  const { data } = await api.post("/perdidias", dto);
  return data;
};

export const actualizarPerdida = async (id: number, dto: ActualizarPerdidaDto) => {
  const { data } = await api.put(`/perdidias/${id}`, dto);
  return data;
};

export const agregarDetallePerdida = async (detalle: Omit<DetallePerdida, "id">) => {
  const { data } = await api.post("/perdidias/detalle", detalle);
  return data;
};

export const actualizarDetallePerdida = async (detalle: DetallePerdida) => {
  const { data } = await api.put("/perdidias/detalle", detalle);
  return data;
};

export const eliminarDetallePerdida = async (idDetalle: number) => {
  const { data } = await api.delete(`/perdidias/detalle/${idDetalle}`);
  return data;
};

export const aprobarPerdida = async (id: number) => {
  const { data } = await api.put(`/perdidias/${id}/aprobar`);
  return data;
};

export const rechazarPerdida = async (id: number) => {
  const { data } = await api.put(`/perdidias/${id}/rechazar`);
  return data;
};
