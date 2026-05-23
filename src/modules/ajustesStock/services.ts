import api from "@/plugins/axios";
import type { AjusteStockLecturaDto, AjustesStockDto } from "./types";

export const ajustarStock = async (dto: AjustesStockDto) => {
  const { data } = await api.post("/ajustes-stock", dto);
  return data;
};

export const obtenerAjustesStock = async (): Promise<AjusteStockLecturaDto[]> => {
  const { data } = await api.get<AjusteStockLecturaDto[]>("/ajustes-stock");
  return data;
};
