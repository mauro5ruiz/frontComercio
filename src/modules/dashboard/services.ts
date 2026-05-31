import api from "@/plugins/axios";
import type { DashboardDto } from "./types";

export async function obtenerDashboard() {
  const { data } = await api.get("/dashboard");
  return normalizarDashboard(data);
}

function normalizarDashboard(payload: any): DashboardDto {
  return {
    cards: payload.cards ?? payload.Cards,
    modulos: payload.modulos ?? payload.Modulos,
    alertas: payload.alertas ?? payload.Alertas,
    resumenOperativo: payload.resumenOperativo ?? payload.ResumenOperativo,
    ultimasVentas: payload.ultimasVentas ?? payload.UltimasVentas ?? [],
  };
}
