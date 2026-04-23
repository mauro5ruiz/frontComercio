<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Proveedores</h1>

    <!-- Botón -->
    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Nuevo proveedor
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
        <input 
            id="chkEliminados"
            type="checkbox" 
            v-model="incluirEliminados" 
        />
        <label for="chkEliminados" class="cursor-pointer">
            Incluir inactivos
        </label>
    </div>

    <!-- Buscador -->
    <input
      v-model="search"
      placeholder="Buscar proveedor..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <!-- Tabla -->
    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Logo</th>
          <th class="p-2">Razón Social</th>
          <th class="p-2">CUIT</th>
          <th class="p-2">Teléfono</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in proveedoresPaginados"
          :key="p.id"
          class="border-b hover:bg-gray-50"
        >
          <!-- IMAGEN -->
          <td class="p-2 w-20 h-16">
            <div class="w-full h-full flex items-center justify-center">
              <img
                v-if="p.urlImagen"
                :src="baseURL + p.urlImagen"
                class="max-w-full max-h-full object-contain"
              />
              <span v-else class="text-gray-400 text-xs">Sin imagen</span>
            </div>
          </td>

          <td class="p-2">{{ p.razonSocial }}</td>
          <td class="p-2">{{ p.cuit }}</td>
          <td class="p-2">{{ p.telefono || "-" }}</td>

          <!-- ACTIVO -->
          <td class="p-2">
            <span :class="p.activo ? 'text-green-600' : 'text-red-500'">
              {{ p.activo ? "Sí" : "No" }}
            </span>
          </td>

          <!-- ACCIONES -->
          <td class="p-2 text-right">
            <button @click="abrirEdicion(p)" class="text-blue-500 mr-2">✏️</button>

            <button
              v-if="p.activo"
              @click="desactivar(p.id)"
              class="text-yellow-500 mr-2"
              title="Desactivar"
            >
              ⛔
            </button>

            <button
              v-else
              @click="activar(p.id)"
              class="text-green-500 mr-2"
              title="Activar"
            >
              ♻️
            </button>

            <button @click="abrirConfirmacion(p.id)" class="text-red-500">
              🗑️
            </button>
          </td>
        </tr>

        <tr v-if="proveedoresFiltrados.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-400">
            No hay proveedores
          </td>
        </tr>
      </tbody>
    </table>

    <!-- PAGINACIÓN -->
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

    <!-- MODAL -->
<div
  v-if="openModal"
  @click.self="cerrarModal"
  class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
>
  <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">

    <!-- HEADER -->
    <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
      <h2 class="text-lg font-bold text-gray-800">
        {{ modoEdicion ? "Editar Proveedor" : "Nuevo Proveedor" }}
      </h2>
    </div>

    <!-- BODY -->
    <div class="p-6 overflow-y-auto space-y-5">

      <!-- DATOS PRINCIPALES -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Datos principales
        </h3>

        <div class="space-y-3">

          <div>
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Razón Social *</label>
              <input
                v-model="razonSocial"
                class="flex-1 border bg-white px-3 py-2 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                :class="errores.razonSocial ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
              />
            </div>
            <p v-if="errores.razonSocial" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.razonSocial }}</p>
          </div>

          <div>
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">CUIT *</label>
              <input
                v-model="cuit"
                placeholder="Ej: 20345678901"
                class="flex-1 border bg-white px-3 py-2 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                :class="errores.cuit ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
              />
            </div>
            <p v-if="errores.cuit" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.cuit }}</p>
          </div>

        </div>
      </div>

      <!-- CONTACTO -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Contacto
        </h3>

        <div class="space-y-3">

          <div>
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Teléfono</label>
              <input v-model="telefono" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
          </div>

          <div>
            <div class="flex items-center gap-3">
              <label class="w-40 text-sm font-medium text-gray-700">Email</label>
              <input v-model="email" type="email" class="flex-1 border px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                :class="errores.email ? 'border-red-400 focus:ring-red-500' : 'border-gray-300'"
              />
            </div>
            <p v-if="errores.email" class="text-xs text-red-500 mt-1 ml-[172px]">{{ errores.email }}</p>
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Persona contacto</label>
            <input v-model="personaContacto" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Cond. IVA</label>
            <input v-model="condicionIva" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

        </div>
      </div>

      <!-- DIRECCIÓN -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Dirección
        </h3>

        <div class="space-y-3">

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Dirección</label>
            <input v-model="direccion" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-3">
              <label class="w-20 text-sm font-medium text-gray-700">Localidad</label>
              <input v-model="localidad" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>

            <div class="flex items-center gap-3">
              <label class="w-20 text-sm font-medium text-gray-700">Provincia</label>
              <input v-model="provincia" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Código Postal</label>
            <input v-model="codigoPostal" class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition" />
          </div>

        </div>
      </div>

      <!-- OBSERVACIONES -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
          Información adicional
        </h3>

        <div class="flex flex-col">
          <label class="text-sm font-medium text-gray-700 mb-1">Observaciones</label>
          <textarea
            v-model="observaciones"
            rows="3"
            class="border border-gray-300 px-3 py-2 rounded-md 
            focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
          ></textarea>
        </div>
      </div>

      <!-- ACTIVO -->
      <div class="flex items-center justify-between border-t pt-4">
        <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" v-model="activo" class="rounded" />
          Activo
        </label>
      </div>

      <!-- IMAGEN -->
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">Imagen</label>

        <input
          type="file"
          accept="image/*"
          @change="onFileChange"
          class="block w-full text-sm text-gray-600
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border
          file:border-gray-300
          file:bg-gray-100 file:text-gray-700
          hover:file:bg-gray-200 transition"
        />

        <button
          v-if="preview"
          @click="quitarImagen"
          class="text-red-500 text-sm mt-2 hover:underline"
        >
          Quitar imagen
        </button>

        <div v-if="preview" class="mt-3">
          <img :src="preview" class="w-24 h-24 object-contain border rounded-md" />
        </div>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">
      <button
        @click="cerrarModal"
        class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
      >
        Cancelar
      </button>

      <button
        @click="guardar"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
      >
        {{ modoEdicion ? "Actualizar" : "Guardar" }}
      </button>
    </div>

  </div>
</div>

    <!-- MODAL DELETE -->
    <div
      v-if="openDeleteModal"
      @click.self="cerrarConfirmacion"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar eliminación</h2>

        <p class="text-sm text-gray-600 mb-4">
          ¿Estás seguro que querés eliminar permanentemente este proveedor?
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
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useProveedoresStore } from "@/modules/proveedores/store";
import { proveedorSchema } from "@/modules/proveedores/schema";

const baseURL = import.meta.env.VITE_FILES_URL;
const store = useProveedoresStore();

const search = ref("");
const openModal = ref(false);
const openDeleteModal = ref(false);
const incluirEliminados = ref(false);

// FORM
const razonSocial = ref("");
const cuit = ref("");
const telefono = ref("");
const email = ref("");
const personaContacto = ref("");
const condicionIva = ref("");
const direccion = ref("");
const localidad = ref("");
const provincia = ref("");
const codigoPostal = ref("");
const observaciones = ref("");
const activo = ref(true);

const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const eliminarImagen = ref(false);

const modoEdicion = ref(false);
const proveedorEditando = ref<number | null>(null);
const proveedorAEliminar = ref<number | null>(null);
const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;

onMounted(() => {
  store.fetchProveedores(incluirEliminados.value);
});

watch(incluirEliminados, (nuevoValor) => {
  page.value = 1;
  store.fetchProveedores(nuevoValor);
});

const proveedoresFiltrados = computed(() =>
  store.proveedores.filter(p => {
    const coincideBusqueda =
      p.razonSocial.toLowerCase().includes(search.value.toLowerCase());

    const incluir =
      incluirEliminados.value ? true : p.activo;

    return coincideBusqueda && incluir;
  })
);

const totalPaginas = computed(() =>
  Math.ceil(proveedoresFiltrados.value.length / pageSize)
);

const proveedoresPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return proveedoresFiltrados.value.slice(start, start + pageSize);
});

// FILE
const onFileChange = (e: any) => {
  const file = e.target.files[0];
  imagen.value = file;
  eliminarImagen.value = false;

  if (file) preview.value = URL.createObjectURL(file);
};

// MODAL
const resetForm = () => {
  razonSocial.value = "";
  cuit.value = "";
  telefono.value = "";
  email.value = "";
  personaContacto.value = "";
  condicionIva.value = "";
  direccion.value = "";
  localidad.value = "";
  provincia.value = "";
  codigoPostal.value = "";
  observaciones.value = "";
  activo.value = true;
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = false;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  proveedorEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = (p: any) => {
  modoEdicion.value = true;
  proveedorEditando.value = p.id;
  errores.value = {};

  razonSocial.value = p.razonSocial ?? "";
  cuit.value = p.cuit ?? "";
  telefono.value = p.telefono ?? "";
  email.value = p.email ?? "";
  personaContacto.value = p.personaContacto ?? "";
  condicionIva.value = p.condicionIva ?? "";
  direccion.value = p.direccion ?? "";
  localidad.value = p.localidad ?? "";
  provincia.value = p.provincia ?? "";
  codigoPostal.value = p.codigoPostal ?? "";
  observaciones.value = p.observaciones ?? "";
  activo.value = p.activo;

  imagen.value = null;
  preview.value = p.urlImagen ? baseURL + p.urlImagen : null;
  eliminarImagen.value = false;

  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

// GUARDAR
const guardar = async () => {
  errores.value = {};

  const formValues = {
    razonSocial: razonSocial.value,
    cuit: cuit.value,
    condicionIva: condicionIva.value || undefined,
    telefono: telefono.value || undefined,
    email: email.value || undefined,
    personaContacto: personaContacto.value || undefined,
    direccion: direccion.value || undefined,
    localidad: localidad.value || undefined,
    provincia: provincia.value || undefined,
    codigoPostal: codigoPostal.value || undefined,
    observaciones: observaciones.value || undefined,
    imagen: imagen.value,
    activo: activo.value
  };

  const resultado = proveedorSchema.safeParse(formValues);

  if (!resultado.success) {
    const fieldErrors = resultado.error.flatten().fieldErrors;
    for (const key in fieldErrors) {
      errores.value[key] = (fieldErrors as any)[key]?.[0];
    }
    return;
  }

  const dto = {
    ...formValues,
    eliminarImagen: eliminarImagen.value
  };

  let ok = false;

  if (modoEdicion.value && proveedorEditando.value) {
    ok = await store.editProveedor(proveedorEditando.value, dto);
  } else {
    ok = await store.addProveedor(dto);
  }

  if (ok) cerrarModal();
};

// DELETE
const abrirConfirmacion = (id: number) => {
  proveedorAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!proveedorAEliminar.value) return;

  const ok = await store.removeProveedor(proveedorAEliminar.value);
  if (ok) cerrarConfirmacion();
};

// SOFT DELETE
const desactivar = async (id: number) => {
  await store.desactivar(id);
};

const activar = async (id: number) => {
  await store.activar(id);
};

const quitarImagen = () => {
  preview.value = null;
  imagen.value = null;
  eliminarImagen.value = true;
};
</script>