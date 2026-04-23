<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Marcas</h1>

    <!-- Botón -->
    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Nueva marca
      </button>
    </div>

    <!-- Buscador -->
    <input
      v-model="search"
      placeholder="Buscar marca..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <!-- Tabla -->
    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Logo</th>
          <th class="p-2">Nombre</th>
          <th class="p-2">Activa</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="m in marcasPaginadas"
          :key="m.id"
          class="border-b hover:bg-gray-50"
        >
          <!-- LOGO -->
          <td class="p-2 w-20 h-16">
            <div class="w-full h-full flex items-center justify-center">
                <img
                v-if="m.imagen"
                :src="baseURL + m.imagen"
                class="max-w-full max-h-full object-contain"
                />
                <span v-else class="text-gray-400 text-xs">Sin imagen</span>
            </div>
           </td>

          <!-- NOMBRE -->
          <td class="p-2">{{ m.nombre }}</td>

          <!-- ACTIVA -->
          <td class="p-2">
            <span
              :class="m.activa ? 'text-green-600' : 'text-red-500'"
            >
              {{ m.activa ? "Sí" : "No" }}
            </span>
          </td>

          <!-- ACCIONES -->
          <td class="p-2 text-right">
            <button @click="abrirEdicion(m)" class="text-blue-500 mr-2">✏️</button>
            <button @click="abrirConfirmacion(m.id)" class="text-red-500">🗑️</button>
          </td>
        </tr>

        <tr v-if="marcasFiltradas.length === 0">
          <td colspan="4" class="text-center py-4 text-gray-400">
            No hay marcas
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
        <button @click="page--" :disabled="page === 1" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            ⬅
        </button>
        <span class="text-sm"> Página {{ page }} de {{ totalPaginas }} </span>

        <button  @click="page++" :disabled="page === totalPaginas" class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
            ➡
        </button>
    </div>
    <!-- MODAL -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar Marca" : "Nueva Marca" }}
        </h2>

        <!-- Nombre -->
        <input
          ref="inputRef"
          v-model="nombre"
          placeholder="Nombre"
          class="w-full border px-3 py-2 rounded mb-3"
        />

        <!-- Activa -->
        <label class="flex items-center gap-2 mb-3">
          <input type="checkbox" v-model="activa" />
          Activa
        </label>

        <!-- Imagen -->
        <input type="file" @change="onFileChange" class="mb-3" />
        <button
            v-if="preview"
            @click="quitarImagen"
            class="text-red-500 text-sm"
            >
                Quitar imagen
        </button>

        <!-- Preview -->
        <div v-if="preview" class="mb-3">
          <img :src="preview" class="w-24 h-24 object-contain border rounded" />
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-2">
          <button @click="cerrarModal" class="bg-gray-200 px-3 py-1 rounded">
            Cancelar
          </button>
          <button @click="guardar" class="bg-blue-500 text-white px-3 py-1 rounded">
            {{ modoEdicion ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </div>
    </div>

    <div
        v-if="openDeleteModal"
        @click.self="cerrarConfirmacion"
        class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
        <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
            <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar eliminación</h2>

            <p class="text-sm text-gray-600 mb-4">¿Estás seguro que querés eliminar esta marca?</p>

            <div class="flex justify-end gap-2">
                <button 
                 @click="cerrarConfirmacion" 
                 class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
                    Cancelar
                </button>
                <button 
                 @click="confirmarEliminacion" 
                 class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600">
                    Eliminar
                </button>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from "vue";
import { useMarcasStore } from "@/modules/marcas/store";

const baseURL = import.meta.env.VITE_FILES_URL;
const store = useMarcasStore();

const search = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);

const nombre = ref("");
const activa = ref(true);
const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const imagenActual = ref<string | null>(null);

const modoEdicion = ref(false);
const marcaEditando = ref<number | null>(null);
const marcaAEliminar = ref<number | null>(null);
const eliminarImagen = ref(false);
const inputRef = ref<HTMLInputElement | null>(null);

const page = ref(1);
const pageSize = 7;
const totalPaginas = computed(() =>
  Math.ceil(marcasFiltradas.value.length / pageSize)
);

onMounted(() => {
  store.fetchMarcas();
});

const marcasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return marcasFiltradas.value.slice(start, start + pageSize);
});

const marcasFiltradas = computed(() =>
  store.marcas.filter(m =>
    m.nombre.toLowerCase().includes(search.value.toLowerCase())
  )
);

// FILE
const onFileChange = (e: any) => {
  const file = e.target.files[0];
  imagen.value = file;
  eliminarImagen.value = false;

  if (file) {
    preview.value = URL.createObjectURL(file);
  }
};

// MODAL
const abrirCrear = async () => {
  modoEdicion.value = false;
  nombre.value = "";
  activa.value = true;
  imagen.value = null;
  preview.value = null;
  openModal.value = true;
  eliminarImagen.value = false;
  await nextTick(); // espero el render
  inputRef.value?.focus();
};

const abrirEdicion = async (m: any) => {
  modoEdicion.value = true;
  marcaEditando.value = m.id;
  nombre.value = m.nombre;
  activa.value = m.activa;
  imagenActual.value = m.imagen;
  preview.value = m.imagen ? baseURL + m.imagen : null;
  eliminarImagen.value = false;
  openModal.value = true;
  await nextTick(); // espero el render
  inputRef.value?.focus();
};

const cerrarModal = () => {
  openModal.value = false;
};

// GUARDAR
const guardar = async () => {
  const dto = {
    nombre: nombre.value,
    activa: activa.value,
    imagen: imagen.value,
    imagenActual: imagenActual.value,
    eliminarImagen: eliminarImagen.value
  };

  let ok = false;

  if (modoEdicion.value && marcaEditando.value) {
    ok = await store.editMarca(marcaEditando.value, dto);
  } else {
    ok = await store.addMarca(dto);
  }

  if (ok) cerrarModal();
};

// DELETE
const abrirConfirmacion = (id: number) => {
  marcaAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!marcaAEliminar.value) return;

  const ok = await store.removeMarca(marcaAEliminar.value);
  if (ok) cerrarConfirmacion();
};

const quitarImagen = () => {
  preview.value = null;
  imagen.value = null;
  eliminarImagen.value = true;
};

</script>