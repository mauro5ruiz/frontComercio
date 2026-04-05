import api from "@/plugins/axios";
import type { FormaDePago, CrearFormaDePagoDTO } from "./types";

export const obtenerFormasDePago = async (): Promise<FormaDePago[]> => {
  const { data } = await api.get("/formas-de-pago");
  return data;
};

export const crearFormaDePago = async (formaDePago: CrearFormaDePagoDTO) => {
  const { data } = await api.post("/formas-de-pago", formaDePago);
  return data;
};

export const eliminarFormaDePago = async (id: number) => {
  await api.delete(`/formas-de-pago/${id}`);
};

export const actualizarFormaDePago = async (id: number, formaDePago: CrearFormaDePagoDTO): Promise<FormaDePago> => {
  const { data } = await api.put(`/formas-de-pago/${id}`, formaDePago);
  return data;
};