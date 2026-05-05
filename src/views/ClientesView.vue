<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Clientes</h1>

    <!-- BOTÓN -->
    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Nuevo cliente
      </button>
    </div>

    <!-- CHECK -->
    <div class="flex items-center gap-2 mb-4">
      <input type="checkbox" v-model="incluirEliminados" />
      <label class="cursor-pointer">Incluir inactivos</label>
    </div>

    <!-- BUSCADOR -->
    <input
      v-model="search"
      placeholder="Buscar cliente..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <!-- TABLA -->
    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="border-b text-left">
          <th class="p-2">Nombre</th>
          <th class="p-2">Documento</th>
          <th class="p-2">CUIT</th>
          <th class="p-2">Teléfono</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="c in clientesPaginados"
          :key="c.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2">{{ c.nombreCompleto }}</td>
          <td class="p-2">{{ c.nroDocumento || "-" }}</td>
          <td class="p-2">{{ c.cuit || "-" }}</td>
          <td class="p-2">{{ c.nroTelefono || "-" }}</td>

          <td class="p-2">
            <span :class="c.activo ? 'text-green-600' : 'text-red-500'">
              {{ c.activo ? "Sí" : "No" }}
            </span>
          </td>

          <td class="p-2 text-right">
            <button @click="abrirEdicion(c)" class="text-blue-500 mr-2">✏️</button>

            <button
              v-if="c.activo"
              @click="darDeBaja(c.id)"
              class="text-yellow-500 mr-2"
            >
              ⛔
            </button>

            <button
              v-else
              @click="restaurar(c.id)"
              class="text-green-500 mr-2"
            >
              ♻️
            </button>

            <button @click="eliminar(c.id)" class="text-red-500">🗑️</button>
          </td>
        </tr>

        <tr v-if="clientesFiltrados.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-400">
            No hay clientes
          </td>
        </tr>
      </tbody>
    </table>

    <!-- PAGINACIÓN -->
    <div class="flex justify-center items-center gap-2 mt-4">
      <button @click="page--" :disabled="page === 1">⬅</button>

      <span>{{ page }} / {{ totalPaginas }}</span>

      <button @click="page++" :disabled="page === totalPaginas">➡</button>
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
        {{ modoEdicion ? "Editar Cliente" : "Nuevo Cliente" }}
      </h2>
    </div>

    <!-- BODY -->
    <div class="p-6 overflow-y-auto space-y-5">

      <!-- TIPO CLIENTE -->
      <div>
        <div class="flex items-center gap-3">
          <label class="w-40 text-sm font-medium text-gray-700">
            Tipo Cliente *
          </label>

          <select
            v-model="tipoCliente"
            class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
          >
            <option :value="1">Persona</option>
            <option :value="2">Empresa</option>
          </select>
        </div>
      </div>

      <!-- PERSONA -->
      <div v-if="tipoCliente === 1" class="space-y-3">

        <div>
          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Nombre</label>
            <input v-model="nombre"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Apellido</label>
            <input v-model="apellido"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

      </div>

      <!-- EMPRESA -->
      <div v-if="tipoCliente === 2" class="space-y-3">

        <div>
          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Razón Social *</label>
            <input v-model="razonSocial"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

        <div>
          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">CUIT *</label>
            <input v-model="cuit"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            />
          </div>
        </div>

      </div>

      <!-- CONTACTO -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Contacto
        </h3>

        <div class="space-y-3">

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Documento</label>
            <input v-model="nroDocumento"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Teléfono</label>
            <input v-model="nroTelefono"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Email</label>
            <input v-model="email"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

        </div>
      </div>

      <!-- DIRECCIÓN -->
      <div>
        <h3 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Dirección
        </h3>

        <div class="space-y-3">

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Dirección</label>
            <input v-model="direccion"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="flex items-center gap-3">
              <label class="w-20 text-sm font-medium text-gray-700">Localidad</label>
              <input v-model="localidad"
                class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>

            <div class="flex items-center gap-3">
              <label class="w-20 text-sm font-medium text-gray-700">Provincia</label>
              <input v-model="provincia"
                class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
          </div>

          <div class="flex items-center gap-3">
            <label class="w-40 text-sm font-medium text-gray-700">Código Postal</label>
            <input v-model="codigoPostal"
              class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
            />
          </div>

        </div>
      </div>

      <!-- OBSERVACIONES -->
      <div>
        <label class="text-sm font-medium text-gray-700 mb-1 block">
          Observaciones
        </label>

        <textarea
          v-model="observaciones"
          rows="3"
          class="w-full border border-gray-300 px-3 py-2 rounded-md"
        ></textarea>
      </div>

      <!-- IMAGEN -->
<div>
  <label class="text-sm font-medium text-gray-700 mb-1 block">
    Imagen
  </label>

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

  <!-- BOTÓN QUITAR -->
  <button
    v-if="preview"
    @click="quitarImagen"
    class="text-red-500 text-sm mt-2 hover:underline"
  >
    Quitar imagen
  </button>

  <!-- PREVIEW -->
  <div v-if="preview" class="mt-3">
    <img
      :src="preview"
      class="w-24 h-24 object-contain border rounded-md"
    />
  </div>
</div>
      <!-- ACTIVO -->
      <div class="flex items-center gap-2 border-t pt-4">
        <input type="checkbox" v-model="activo" />
        <label class="text-sm text-gray-700">Activo</label>
      </div>

    </div>

    <!-- FOOTER -->
    <div class="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">

      <button
        @click="cerrarModal"
        class="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
      >
        Cancelar
      </button>

      <button
        @click="guardar"
        class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        {{ modoEdicion ? "Actualizar" : "Guardar" }}
      </button>

    </div>

  </div>
</div>

  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useClientesStore } from "@/modules/clientes/store";
import { clienteSchema } from "@/modules/clientes/schema";
import { useNotificationStore } from "@/stores/notificaciones";

const notification = useNotificationStore();
const store = useClientesStore();

const search = ref("");
const incluirEliminados = ref(false);

const openModal = ref(false);
const modoEdicion = ref(false);
const clienteEditando = ref<number | null>(null);

const page = ref(1);
const pageSize = 7;

// FORM
const tipoCliente = ref(1);
const nombre = ref("");
const apellido = ref("");
const razonSocial = ref("");
const nroDocumento = ref("");
const cuit = ref("");
const nroTelefono = ref("");
const email = ref("");
const direccion = ref("");
const localidad = ref("");
const provincia = ref("");
const codigoPostal = ref("");
const condicionIva = ref("");
const observaciones = ref("");
const activo = ref(true);

const imagen = ref<File | null>(null);
const preview = ref<string | null>(null);
const eliminarImagen = ref(false);

onMounted(() => store.fetchClientes());

watch(incluirEliminados, (v) => {
  store.fetchClientes(v);
});

const clientesFiltrados = computed(() =>
  store.clientes.filter(c =>
    c.nombreCompleto.toLowerCase().includes(search.value.toLowerCase())
  )
);

const totalPaginas = computed(() =>
  Math.ceil(clientesFiltrados.value.length / pageSize)
);

const clientesPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return clientesFiltrados.value.slice(start, start + pageSize);
});

const resetForm = () => {
  tipoCliente.value = 1;
  nombre.value = "";
  apellido.value = "";
  razonSocial.value = "";
  nroDocumento.value = "";
  cuit.value = "";
  nroTelefono.value = "";
  email.value = "";
  direccion.value = "";
  localidad.value = "";
  provincia.value = "";
  codigoPostal.value = "";
  condicionIva.value = "";
  observaciones.value = "";
  activo.value = true;
  imagen.value = null;
  preview.value = null;
};

const abrirCrear = () => {
  resetForm();
  modoEdicion.value = false;
  openModal.value = true;
};
const baseURL = import.meta.env.VITE_FILES_URL;
const abrirEdicion = (c: any) => {
  modoEdicion.value = true;
  clienteEditando.value = c.id;

  tipoCliente.value = c.tipoCliente;
  nombre.value = c.nombre ?? "";
  apellido.value = c.apellido ?? "";
  razonSocial.value = c.razonSocial ?? "";
  nroDocumento.value = c.nroDocumento ?? "";
  cuit.value = c.cuit ?? "";
  nroTelefono.value = c.nroTelefono ?? "";
  email.value = c.email ?? "";
  direccion.value = c.direccion ?? "";
  localidad.value = c.localidad ?? "";
  provincia.value = c.provincia ?? "";
  codigoPostal.value = c.codigoPostal ?? "";
  condicionIva.value = c.condicionIva ?? "";
  observaciones.value = c.observaciones ?? "";
  activo.value = c.activo;

  preview.value = c.urlImagen
  ? `${baseURL.replace(/\/$/, "")}/${c.urlImagen.replace(/^\//, "")}`
  : null;
  eliminarImagen.value = false;
  imagen.value = null;
  openModal.value = true;
};
const getImageUrl = (url?: string | null) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${baseURL.replace(/\/$/, "")}/${url.replace(/^\//, "")}`;
};
const cerrarModal = () => (openModal.value = false);

const guardar = async () => {
  try {
    const form = {
      tipoCliente: tipoCliente.value,
      nombre: nombre.value,
      apellido: apellido.value,
      razonSocial: razonSocial.value,
      nroDocumento: nroDocumento.value,
      cuit: cuit.value,
      nroTelefono: nroTelefono.value,
      email: email.value,
      direccion: direccion.value,
      localidad: localidad.value,
      provincia: provincia.value,
      codigoPostal: codigoPostal.value,
      condicionIva: condicionIva.value,
      observaciones: observaciones.value,
      activo: activo.value,
      imagen: imagen.value,
      eliminarImagen: eliminarImagen.value
    };

    clienteSchema.parse(form); // 👈 si falla, salta error

    if (modoEdicion.value && clienteEditando.value) {
      await store.editCliente(clienteEditando.value, form);
    } else {
      await store.addCliente(form);
    }

    cerrarModal();
  } 
  catch (err: any) {
    const mensaje = err.issues?.[0]?.message || "Error en el formulario";

    notification.show(mensaje, "error");
  }
};

const darDeBaja = (id: number) => store.darDeBaja(id);
const restaurar = (id: number) => store.restaurar(id);
const eliminar = (id: number) => store.removeCliente(id);

const onFileChange = (e: any) => {
  const file = e.target.files[0];
  imagen.value = file;
  eliminarImagen.value = false;

  if (file) 
    preview.value = URL.createObjectURL(file);
};

const quitarImagen = () => {
  imagen.value = null;
  preview.value = null;
  eliminarImagen.value = true;
};
</script>