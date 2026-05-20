import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import type { Vendedor, CrearVendedorDto } from "./types";
import {
  obtenerVendedores,
  obtenerVendedorPorId,
  crearVendedor,
  actualizarVendedor,
  darDeBajaVendedor,
  restaurarVendedor,
  eliminarVendedorPermanentemente
} from "./services";

export const useVendedoresStore = defineStore("vendedores", () => {
  const vendedores = ref<Vendedor[]>([]);
  const loading = ref(false);
  const notification = useNotificationStore();

  const fetchVendedores = async (incluirEliminados = false) => {
    loading.value = true;
    try {
      vendedores.value = await obtenerVendedores(incluirEliminados);
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al cargar vendedores", "error");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getVendedorPorId = async (id: number) => {
    return await obtenerVendedorPorId(id);
  };

  const addVendedor = async (dto: CrearVendedorDto) => {
    try {
      await crearVendedor(dto);
      notification.show("Vendedor creado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo guardar el vendedor", "error");
      return false;
    }
  };

  const editVendedor = async (id: number, dto: CrearVendedorDto) => {
    try {
      await actualizarVendedor(id, dto);
      notification.show("Vendedor actualizado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo guardar el vendedor", "error");
      return false;
    }
  };

  const bajaVendedor = async (id: number) => {
    try {
      await darDeBajaVendedor(id);
      notification.show("Vendedor dado de baja", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo dar de baja", "error");
      return false;
    }
  };

  const restoreVendedor = async (id: number) => {
    try {
      await restaurarVendedor(id);
      notification.show("Vendedor restaurado", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo restaurar", "error");
      return false;
    }
  };

  const removeVendedor = async (id: number) => {
    try {
      await eliminarVendedorPermanentemente(id);
      notification.show("Vendedor eliminado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo eliminar el vendedor", "error");
      return false;
    }
  };

  return {
    vendedores,
    loading,
    fetchVendedores,
    getVendedorPorId,
    addVendedor,
    editVendedor,
    bajaVendedor,
    restoreVendedor,
    removeVendedor
  };
});
