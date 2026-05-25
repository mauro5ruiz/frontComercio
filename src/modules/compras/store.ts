import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import type { Compra, CrearCompraDTO, PagarProveedorDTO } from "./types";
import {
  anularCompra,
  crearCompra,
  obtenerCompraPorId,
  obtenerComprasEntreFechas,
  pagarProveedor,
} from "./services";

const getApiMessage = (err: any, fallback: string) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.response?.data?.mensaje ||
  err.response?.data?.Mensaje ||
  fallback;

export const useComprasStore = defineStore("compras", () => {
  const compras = ref<Compra[]>([]);
  const compraSeleccionada = ref<Compra | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  const fetchCompras = async (desde: string, hasta: string) => {
    loading.value = true;
    try {
      error.value = null;
      compras.value = await obtenerComprasEntreFechas(desde, hasta);
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudieron obtener las compras");
      error.value = message;
      notification.show(message, "error");
    } finally {
      loading.value = false;
    }
  };

  const fetchCompraPorId = async (id: number) => {
    try {
      error.value = null;
      compraSeleccionada.value = await obtenerCompraPorId(id);
      return compraSeleccionada.value;
    } catch (err: any) {
      const message = getApiMessage(err, "No se pudo obtener la compra");
      error.value = message;
      notification.show(message, "error");
      return null;
    }
  };

  const addCompra = async (dto: CrearCompraDTO) => {
    try {
      error.value = null;
      const resp = await crearCompra(dto);
      notification.show(resp.mensaje || "Compra creada correctamente", "success");
      return resp.idCompra;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al crear la compra");
      error.value = message;
      notification.show(message, "error");
      return null;
    }
  };

  const cancelarCompra = async (id: number) => {
    try {
      error.value = null;
      const resp = await anularCompra(id);
      notification.show(resp.mensaje || "Compra anulada correctamente", "success");
      return true;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al anular la compra");
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  const registrarPagoProveedor = async (dto: PagarProveedorDTO) => {
    try {
      error.value = null;
      const resp = await pagarProveedor(dto);
      notification.show(resp.mensaje || "Pago registrado correctamente", "success");
      return true;
    } catch (err: any) {
      const message = getApiMessage(err, "Error al registrar el pago");
      error.value = message;
      notification.show(message, "error");
      return false;
    }
  };

  return {
    compras,
    compraSeleccionada,
    loading,
    error,
    fetchCompras,
    fetchCompraPorId,
    addCompra,
    cancelarCompra,
    registrarPagoProveedor,
  };
});
