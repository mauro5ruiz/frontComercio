import { defineStore } from "pinia";
import { ref } from "vue";
import type { Categoria } from "./types";
import { obtenerCategorias, crearCategoria, eliminarCategoria, actualizarCategoria } from "./services";
import { useNotificationStore } from "@/stores/notificaciones";

export const useCategoriasStore = defineStore("categorias", () => {
  const categorias = ref<Categoria[]>([]);
  const loading = ref(false);
  const notification = useNotificationStore();

  const fetchCategorias = async () => {
    loading.value = true;
    try {
      categorias.value = await obtenerCategorias();
    } finally {
      loading.value = false;
    }
  };

  const error = ref<string | null>(null);

  const addCategoria = async (nombre: string) => {
    try {
      error.value = null;

      const nueva = await crearCategoria({ nombre });
      categorias.value.push(nueva);
      notification.show("Categoría creada con éxito", "success");
    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al crear la categoría", "error");
    }
  };

  const editCategoria = async (id: number, nombre: string) => {
    try {
      error.value = null;

      const actualizada = await actualizarCategoria(id, { nombre });

      const index = categorias.value.findIndex(c => c.id === id);
      if (index !== -1) categorias.value[index] = actualizada;
      notification.show("Categoría actualizada con éxito", "success");

    } catch (err: any) {
      notification.show(err.response?.data?.error || "Error al actualizar la categoría", "error");
    }
  };

  const removeCategoria = async (id: number) => {
    try {
      error.value = null;

      await eliminarCategoria(id);
      categorias.value = categorias.value.filter(c => c.id !== id);
      notification.show("Categoría eliminada con éxito", "success");

    } catch (err: any) {
      notification.show(err.response?.data?.error || "No se puede eliminar la categoría", "error");
    }
  };

  return {
    categorias,
    loading,
    fetchCategorias,
    addCategoria,
    editCategoria,
    removeCategoria
  };
});