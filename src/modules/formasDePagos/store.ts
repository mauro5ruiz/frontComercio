import { defineStore } from "pinia";
import { ref } from "vue";
import type { FormaDePago } from "./types";
import { obtenerFormasDePago, crearFormaDePago, eliminarFormaDePago, actualizarFormaDePago } from "./services";
import { useNotificationStore } from "@/stores/notificaciones";

export const useFormasDePagoStore = defineStore("formasDePagos", () => {
  const formasDePago = ref<FormaDePago[]>([]);
  const loading = ref(false);
  const notification = useNotificationStore();

  const fetchFormasDePago = async () => {
    loading.value = true;
    try {
      formasDePago.value = await obtenerFormasDePago();
    } finally {
      loading.value = false;
    }
  };

  const error = ref<string | null>(null);

  const addFormaDePago = async (nombre: string) => {
    try {
      error.value = null;

      const nueva = await crearFormaDePago({ nombre });
      formasDePago.value.push(nueva);
      notification.show("Forma de pago creada con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al crear la forma de pago", "error");
      return false;
    }
  };

  const editFormaDePago = async (id: number, nombre: string) => {
    try {
      error.value = null;

      const actualizada = await actualizarFormaDePago(id, { nombre });

      const index = formasDePago.value.findIndex(c => c.id === id);
      if (index !== -1) formasDePago.value[index] = actualizada;
      notification.show("Forma de pago actualizada con éxito", "success");
      return true;

    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al actualizar la forma de pago", "error");
      return false;
    }
  };

  const removeFormaDePago = async (id: number) => {
    try {
      error.value = null;

      await eliminarFormaDePago(id);
      formasDePago.value = formasDePago.value.filter(c => c.id !== id);
      notification.show("Forma de pago eliminada con éxito", "success");
      return true;

    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se puede eliminar la forma de pago", "error");
      return false;
    }
  };

  return {
    formasDePago,
    loading,
    fetchFormasDePago,
    addFormaDePago,
    editFormaDePago,
    removeFormaDePago
  };
});