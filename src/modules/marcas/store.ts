import { defineStore } from "pinia";
import { ref } from "vue";
import type { Marca, CrearMarcaDTO } from "./types";
import {
  obtenerMarcas,
  crearMarca,
  eliminarMarca,
  actualizarMarca
} from "./services";
import { useNotificationStore } from "@/stores/notificaciones";

export const useMarcasStore = defineStore("marcas", () => {
  const marcas = ref<Marca[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const notification = useNotificationStore();

  // GET
  const fetchMarcas = async () => {
    loading.value = true;
    try {
      marcas.value = await obtenerMarcas();
      console.log("Marcas cargadas:", marcas.value);
    } finally {
      loading.value = false;
    }
  };

  // CREATE
  const addMarca = async (marca: CrearMarcaDTO) => {
    try {
      error.value = null;

      const nueva = await crearMarca(marca);
      marcas.value.push(nueva);

      notification.show("Marca creada con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al crear la marca",
        "error"
      );
      return false;
    }
  };

  // UPDATE (🔥 ahora usamos lo que devuelve el backend)
  const editMarca = async (id: number, marca: CrearMarcaDTO) => {
    try {
      error.value = null;

      const actualizada = await actualizarMarca(id, marca);

      const index = marcas.value.findIndex(m => m.id === id);
      if (index !== -1) {
        marcas.value[index] = actualizada;
      }

      notification.show("Marca actualizada con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "Error al actualizar la marca",
        "error"
      );
      return false;
    }
  };

  // DELETE
  const removeMarca = async (id: number) => {
    try {
      error.value = null;

      await eliminarMarca(id);
      marcas.value = marcas.value.filter(m => m.id !== id);

      notification.show("Marca eliminada con éxito", "success");
      return true;
    } catch (err: any) {
      notification.show(
        err.response?.data?.error || "No se puede eliminar la marca",
        "error"
      );
      return false;
    }
  };

  return {
    marcas,
    loading,
    error,
    fetchMarcas,
    addMarca,
    editMarca,
    removeMarca
  };
});