import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import type { AnularVentaDTO, CobrarClienteDTO, CrearVentaDTO, Venta } from "./types";
import {
  anularVenta,
  cobrarCliente,
  crearVenta,
  obtenerPendientesPorCliente,
  obtenerVentaPorId,
  obtenerVentasEntreFechas,
} from "./services";

const getApiMessage = (err: any, fallback: string) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.response?.data?.mensaje ||
  err.response?.data?.Mensaje ||
  fallback;

export const useVentasStore = defineStore("ventas", () => {
  const ventas = ref<Venta[]>([]);
  const ventaSeleccionada = ref<Venta | null>(null);
  const ventasPendientesCliente = ref<Venta[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  const fetchVentas = async (desde: string, hasta: string) => {
    loading.value = true;
    try {
      error.value = null;
      ventas.value = await obtenerVentasEntreFechas(desde, hasta);
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudieron obtener las ventas");
      error.value = message;
      notification.show(message, "error");
    } finally {
      loading.value = false;
    }
  };

  const fetchVentaPorId = async (id: number) => {
    try {
      error.value = null;
      ventaSeleccionada.value = await obtenerVentaPorId(id);
      return ventaSeleccionada.value;
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudo obtener la venta");
      error.value = message;
      notification.show(message, "error");
      return null;
    }
  };

  const addVenta = async (dto: CrearVentaDTO) => {
    try {
      error.value = null;
      const resp = await crearVenta(dto);
      notification.show(resp.mensaje || "Venta creada correctamente", "success");
      return resp.idVenta;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al crear la venta");
      error.value = message;
      notification.show(message, "error");
      return null;
    }
  };

  const cancelarVenta = async (id: number, dto?: AnularVentaDTO) => {
    try {
      error.value = null;
      const resp = await anularVenta(id, dto);
      notification.show(resp.mensaje || "Venta anulada correctamente", "success");
      return true;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al anular la venta");
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  const fetchPendientesPorCliente = async (idCliente: number) => {
    try {
      error.value = null;
      ventasPendientesCliente.value = await obtenerPendientesPorCliente(idCliente);
      return ventasPendientesCliente.value;
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudieron obtener las ventas pendientes del cliente");
      error.value = message;
      notification.show(message, "error");
      ventasPendientesCliente.value = [];
      return [];
    }
  };

  const registrarCobro = async (dto: CobrarClienteDTO) => {
    try {
      error.value = null;
      const resp = await cobrarCliente(dto);
      notification.show(resp.mensaje || "Cobro registrado correctamente", "success");
      return true;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al registrar el cobro");
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  return {
    ventas,
    ventaSeleccionada,
    ventasPendientesCliente,
    loading,
    error,
    fetchVentas,
    fetchVentaPorId,
    fetchPendientesPorCliente,
    addVenta,
    cancelarVenta,
    registrarCobro,
  };
});
