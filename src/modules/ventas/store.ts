import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import type { CobrarClienteDTO, CrearVentaDTO, Venta } from "./types";
import { anularVenta, cobrarCliente, crearVenta, obtenerVentaPorId, obtenerVentasEntreFechas } from "./services";

export const useVentasStore = defineStore("ventas", () => {
  const ventas = ref<Venta[]>([]);
  const ventaSeleccionada = ref<Venta | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  const fetchVentas = async (desde: string, hasta: string) => {
    loading.value = true;
    try {
      error.value = null;
      ventas.value = await obtenerVentasEntreFechas(desde, hasta);
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.Error || "No se pudieron obtener las ventas";
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
      const message = err.response?.data?.error || err.response?.data?.Error || "No se pudo obtener la venta";
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
      const message = err.response?.data?.error || err.response?.data?.Error || "Error al crear la venta";
      error.value = message;
      notification.show(message, "error");
      return null;
    }
  };

  const cancelarVenta = async (id: number) => {
    try {
      error.value = null;
      const resp = await anularVenta(id);
      notification.show(resp.mensaje || "Venta anulada correctamente", "success");
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.Error || "Error al anular la venta";
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  const registrarCobro = async (dto: CobrarClienteDTO) => {
    try {
      error.value = null;
      const resp = await cobrarCliente(dto);
      notification.show(resp.mensaje || "Cobro registrado correctamente", "success");
      return true;
    } catch (err: any) {
      const message = err.response?.data?.error || err.response?.data?.Error || "Error al registrar el cobro";
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  return {
    ventas,
    ventaSeleccionada,
    loading,
    error,
    fetchVentas,
    fetchVentaPorId,
    addVenta,
    cancelarVenta,
    registrarCobro,
  };
});
