import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Proveedor,
  CrearProveedorDTO,
  ActualizarProveedorDTO
} from "./types";
import {
  obtenerProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
  desactivarProveedor,
  activarProveedor
} from "./services";
import { useNotificationStore } from "@/stores/notificaciones";

export const useProveedoresStore = defineStore("proveedores", () => {
  const proveedores = ref<Proveedor[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  //
  // GET
  //
  const fetchProveedores = async (incluirEliminados = false) => {
    loading.value = true;
    try {
      proveedores.value = await obtenerProveedores(incluirEliminados);
      console.log("Proveedores cargados:", proveedores.value);
    } finally {
      loading.value = false;
    }
  };

  //
  // CREATE
  //
  const addProveedor = async (proveedor: CrearProveedorDTO) => {
    try {
      error.value = null;

      const nuevo = await crearProveedor(proveedor);
      proveedores.value.push(nuevo);

      notification.show("Proveedor creado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al crear el proveedor",
        "error"
      );
      return false;
    }
  };

  //
  // UPDATE
  //
  const editProveedor = async (
    id: number,
    proveedor: ActualizarProveedorDTO
  ) => {
    try {
      error.value = null;

      const actualizado = await actualizarProveedor(id, proveedor);

      const index = proveedores.value.findIndex(p => p.id === id);
      if (index !== -1) {
        proveedores.value[index] = actualizado;
      }

      notification.show("Proveedor actualizado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al actualizar el proveedor",
        "error"
      );
      return false;
    }
  };

  //
  // DELETE (permanente)
  //
  const removeProveedor = async (id: number) => {
    try {
      error.value = null;

      await eliminarProveedor(id);
      proveedores.value = proveedores.value.filter(p => p.id !== id);

      notification.show("Proveedor eliminado con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "No se puede eliminar el proveedor",
        "error"
      );
      return false;
    }
  };

  //
  // SOFT DELETE (desactivar)
  //
  const desactivar = async (id: number) => {
    try {
      error.value = null;

      await desactivarProveedor(id);

      const proveedor = proveedores.value.find(p => p.id === id);
      if (proveedor) {
        proveedor.activo = false;
      }

      notification.show("Proveedor desactivado", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al desactivar",
        "error"
      );
      return false;
    }
  };

  //
  // RESTORE (activar)
  //
  const activar = async (id: number) => {
    try {
      error.value = null;

      await activarProveedor(id);

      const proveedor = proveedores.value.find(p => p.id === id);
      if (proveedor) {
        proveedor.activo = true;
      }

      notification.show("Proveedor activado", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al activar",
        "error"
      );
      return false;
    }
  };

  return {
    proveedores,
    loading,
    error,
    fetchProveedores,
    addProveedor,
    editProveedor,
    removeProveedor,
    desactivar,
    activar
  };
});