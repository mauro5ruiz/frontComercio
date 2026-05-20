import { defineStore } from "pinia";
import { ref } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import type {
  Producto,
  ActualizacionPrecioIndividualDto,
  ActualizacionPrecioMasivaDto
} from "./types";
import {
  obtenerProductos,
  obtenerProductoPorId,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  darDeBajaProducto,
  restaurarProducto,
  obtenerProductosBajoStock,
  actualizarPrecioIndividual,
  actualizarPreciosMasivos
} from "./services";

export const useProductosStore = defineStore("productos", () => {
  const productos = ref<Producto[]>([]);
  const loading = ref(false);
  const notification = useNotificationStore();

  const fetchProductos = async (incluirEliminados = false) => {
    loading.value = true;
    try {
      productos.value = await obtenerProductos(incluirEliminados);
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al cargar productos", "error");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const fetchProductosBajoStock = async () => {
    loading.value = true;
    try {
      productos.value = await obtenerProductosBajoStock();
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al cargar productos con bajo stock", "error");
      return false;
    } finally {
      loading.value = false;
    }
  };

  const getProductoPorId = async (id: number) => {
    return await obtenerProductoPorId(id);
  };

  const addProducto = async (formData: FormData) => {
    try {
      await crearProducto(formData);
      notification.show("Producto creado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo guardar el producto", "error");
      return false;
    }
  };

  const editProducto = async (id: number, formData: FormData) => {
    try {
      await actualizarProducto(id, formData);
      notification.show("Producto actualizado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo guardar el producto", "error");
      return false;
    }
  };

  const removeProducto = async (id: number) => {
    try {
      await eliminarProducto(id);
      notification.show("Producto eliminado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo eliminar el producto", "error");
      return false;
    }
  };

  const bajaProducto = async (id: number) => {
    try {
      await darDeBajaProducto(id);
      notification.show("Producto dado de baja", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo dar de baja", "error");
      return false;
    }
  };

  const restoreProducto = async (id: number) => {
    try {
      await restaurarProducto(id);
      notification.show("Producto restaurado", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo restaurar", "error");
      return false;
    }
  };

  const patchPrecioIndividual = async (id: number, dto: ActualizacionPrecioIndividualDto) => {
    try {
      await actualizarPrecioIndividual(id, dto);
      notification.show("Precio actualizado correctamente", "success");
      return true;
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo actualizar el precio", "error");
      return false;
    }
  };

  const patchPreciosMasivos = async (dto: ActualizacionPrecioMasivaDto) => {
    try {
      const afectados = await actualizarPreciosMasivos(dto);
      notification.show(`Precios actualizados. Registros afectados: ${afectados}`, "success");
      return { ok: true, afectados };
    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se pudo actualizar precios masivos", "error");
      return { ok: false, afectados: 0 };
    }
  };

  return {
    productos,
    loading,
    fetchProductos,
    fetchProductosBajoStock,
    getProductoPorId,
    addProducto,
    editProducto,
    removeProducto,
    bajaProducto,
    restoreProducto,
    patchPrecioIndividual,
    patchPreciosMasivos
  };
});
