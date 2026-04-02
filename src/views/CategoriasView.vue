<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Categorías</h1>

    <!-- Botón abrir modal -->
    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        ➕ Nueva categoría
      </button>
    </div>

    <!-- Lista -->
    <ul class="bg-white rounded shadow">
      <li
        v-for="c in store.categorias"
        :key="c.id"
        class="flex justify-between items-center px-4 py-2 border-b hover:bg-gray-50"
      >
        <span>{{ c.nombre }}</span>
        <div class="flex items-center gap-2">
          <!-- EDITAR -->
          <button @click="abrirEdicion(c)" class="text-blue-500 hover:text-blue-600 text-sm" title="Editar">
            ✏️
          </button>
          <!-- ELIMINAR -->
          <button @click="abrirConfirmacion(c.id)" class="text-red-500 hover:text-red-600 text-sm" title="Eliminar">
            🗑️
          </button>
        </div>
      </li>
      <li
        v-if="store.categorias.length === 0"
        class="text-center text-gray-400 py-4"
      >
        No hay categorías
      </li>
    </ul>

    <!-- MODAL GUARDAR CATEGORÍA -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <!-- Título -->
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar Categoría" : "Nueva Categoría" }}
        </h2>
        <!-- Input -->
        <input
          ref="inputRef"
          v-model="nombre"
          placeholder="Nombre de la categoría"
          maxlength="50"
          class="w-full border px-3 py-2 rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="errores.nombre ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'"
        />
        <p v-if="errores.nombre" class="text-sm text-red-500 mb-3">
          {{ errores.nombre }}
        </p>
        <!-- Acciones -->
        <div class="flex justify-end gap-2">
          <button @click="cerrarModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="guardar" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
            {{ modoEdicion ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL ELIMINAR CATEGORÍA -->
     <div
        v-if="openDeleteModal"
        @click.self="cerrarConfirmacion"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
          <h2 class="text-lg font-bold mb-3 text-gray-800">
            Confirmar eliminación
          </h2>
          <p class="text-sm text-gray-600 mb-4">
            ¿Estás seguro que querés eliminar esta categoría?
          </p>
          <div class="flex justify-end gap-2">
            <button @click="cerrarConfirmacion" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
              Cancelar
            </button>
            <button @click="confirmarEliminacion" class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
              Eliminar
            </button>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useCategoriasStore } from "@/modules/categorias/store";
import { nextTick } from "vue";

const errores = ref<{ nombre?: string }>({});
const store = useCategoriasStore();

const nombre = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);
const categoriaAEliminar = ref<number | null>(null);
const modoEdicion = ref(false);
const categoriaEditando = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// 🚀 cargar datos
onMounted(() => {
  store.fetchCategorias();
});

const abrirCrear = async () => {
  errores.value = {};
  modoEdicion.value = false;
  categoriaEditando.value = null;
  nombre.value = "";
  openModal.value = true;
  await nextTick(); // espero el render
  inputRef.value?.focus();
};

// ❌ cerrar modal
const cerrarModal = () => {
  openModal.value = false;
  nombre.value = "";
  modoEdicion.value = false;
  categoriaEditando.value = null;
};

// ✅ crear categoría
const crear = async () => {
  if (!nombre.value.trim()) return;

  await store.addCategoria(nombre.value);

  cerrarModal();
};

import { categoriaSchema } from "@/modules/categorias/schema";

const guardar = async () => {
  errores.value = {};

  const resultado = categoriaSchema.safeParse({ nombre: nombre.value });

  if (!resultado.success) {
    const fieldErrors = resultado.error.flatten().fieldErrors;
    errores.value.nombre = fieldErrors.nombre?.[0];
    return; // 🚫 NO va a la API
  }

  if (modoEdicion.value && categoriaEditando.value)
    await store.editCategoria(categoriaEditando.value, nombre.value);
  else
    await store.addCategoria(nombre.value);

  cerrarModal();
};

const abrirConfirmacion = (id: number) => {
  categoriaAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
  categoriaAEliminar.value = null;
};

const confirmarEliminacion = async () => {
  if (!categoriaAEliminar.value) return;

  await store.removeCategoria(categoriaAEliminar.value);

  cerrarConfirmacion();
};

const abrirEdicion = async (categoria: any) => {
  modoEdicion.value = true;
  categoriaEditando.value = categoria.id;
  nombre.value = categoria.nombre;
  openModal.value = true;
  await nextTick();
  inputRef.value?.focus();
};


</script>