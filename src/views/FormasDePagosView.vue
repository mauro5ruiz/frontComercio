<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Formas de Pago</h1>

    <!-- Botón abrir modal -->
    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        ➕ Nueva forma de Pago
      </button>
    </div>

    <!-- Lista -->
    <ul class="bg-white rounded shadow">
      <div class="mb-4">
        <input
          v-model="search"
          placeholder="Buscar forma de pago..."
          class="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <li
        v-for="f in formasDePagoPaginadas"
        :key="f.id"
        class="flex justify-between items-center px-4 py-2 border-b hover:bg-gray-50"
      >
        <span>{{ f.nombre }}</span>
        <div class="flex items-center gap-2">
          <!-- EDITAR -->
          <button @click="abrirEdicion(f)" class="text-blue-500 hover:text-blue-600 text-sm" title="Editar">
            ✏️
          </button>
          <!-- ELIMINAR -->
          <button @click="abrirConfirmacion(f.id)" class="text-red-500 hover:text-red-600 text-sm" title="Eliminar">
            🗑️
          </button>
        </div>
      </li>
      <li
        v-if="formasDePagoFiltradas.length === 0"
        class="text-center text-gray-400 py-4"
      >
        No hay formas de pago
      </li>
    </ul>
    <div class="flex justify-center items-center gap-2 mt-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ⬅
      </button>

      <span class="text-sm">
        Página {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        ➡
      </button>
    </div>

    <!-- MODAL GUARDAR FORMA DE PAGO -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <!-- Título -->
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar Forma de Pago" : "Nueva Forma de Pago" }}
        </h2>
        <!-- Input -->
        <input
          ref="inputRef"
          v-model="nombre"
          placeholder="Nombre de la forma de pago"
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

    <!-- MODAL ELIMINAR FORMA DE PAGO -->
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
            ¿Estás seguro que querés eliminar esta forma de pago?
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
import { useFormasDePagoStore } from "@/modules/formasDePagos/store";
import { formaDePagoSchema } from "@/modules/formasDePagos/schema";
import { nextTick } from "vue";
import { computed } from "vue";

const search = ref("");
const page = ref(1);
const pageSize = 10; // cantidad por página

const errores = ref<{ nombre?: string }>({});
const store = useFormasDePagoStore();

const nombre = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);
const formaDePagoAEliminar = ref<number | null>(null);
const modoEdicion = ref(false);
const formaDePagoEditando = ref<number | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

// 🚀 cargar datos
onMounted(() => {
  store.fetchFormasDePago();
});

const formasDePagoFiltradas = computed(() => {
  return store.formasDePago.filter(c =>
    c.nombre.toLowerCase().includes(search.value.toLowerCase())
  );
});

const totalPaginas = computed(() =>
  Math.ceil(formasDePagoFiltradas.value.length / pageSize)
);

const formasDePagoPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return formasDePagoFiltradas.value.slice(start, start + pageSize);
});

const abrirCrear = async () => {
  errores.value = {};
  modoEdicion.value = false;
  formaDePagoEditando.value = null;
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
  formaDePagoEditando.value = null;
};

// ✅ crear forma de pago
const crear = async () => {
  if (!nombre.value.trim()) return;

  await store.addFormaDePago(nombre.value);

  cerrarModal();
};

const guardar = async () => {
  errores.value = {};

  let rdoOperacion = false;
  const resultado = formaDePagoSchema.safeParse({ nombre: nombre.value });

  if (!resultado.success) {
    const fieldErrors = resultado.error.flatten().fieldErrors;
    errores.value.nombre = fieldErrors.nombre?.[0];
    return; // 🚫 NO va a la API
  }

  if (modoEdicion.value && formaDePagoEditando.value)
    rdoOperacion = await store.editFormaDePago(formaDePagoEditando.value, nombre.value);
  else
    rdoOperacion = await store.addFormaDePago(nombre.value);

  if (rdoOperacion) cerrarModal();
};

const abrirConfirmacion = (id: number) => {
  formaDePagoAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
  formaDePagoAEliminar.value = null;
};

const confirmarEliminacion = async () => {
  if (!formaDePagoAEliminar.value) return;

  let rdoOperacion = false;

  rdoOperacion = await store.removeFormaDePago(formaDePagoAEliminar.value);

  if (rdoOperacion) cerrarConfirmacion();
};

const abrirEdicion = async (formaDePago: any) => {
  modoEdicion.value = true;
  formaDePagoEditando.value = formaDePago.id;
  nombre.value = formaDePago.nombre;
  openModal.value = true;
  await nextTick();
  inputRef.value?.focus();
};


</script>