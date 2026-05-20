<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Vendedores</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Nuevo vendedor
      </button>
    </div>

    <div class="flex items-center gap-2 mb-4">
      <input id="chkEliminados" type="checkbox" v-model="incluirEliminados" />
      <label for="chkEliminados" class="cursor-pointer">
        Incluir inactivos
      </label>
    </div>

    <input
      v-model="search"
      placeholder="Buscar vendedor..."
      class="w-full border px-3 py-2 rounded mb-4"
    />

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Nombre</th>
          <th class="p-2">DNI</th>
          <th class="p-2">Email</th>
          <th class="p-2">Teléfono</th>
          <th class="p-2">Activo</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="v in vendedoresPaginados"
          :key="v.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2">{{ v.nombre }} {{ v.apellido }}</td>
          <td class="p-2">{{ v.nroDni }}</td>
          <td class="p-2">{{ v.email || "-" }}</td>
          <td class="p-2">{{ v.telefono || "-" }}</td>

          <td class="p-2">
            <span :class="v.activo ? 'text-green-600' : 'text-red-500'">
              {{ v.activo ? "Sí" : "No" }}
            </span>
          </td>

          <td class="p-2 text-right">
            <button @click="abrirEdicion(v)" class="text-blue-500 mr-2">✏️</button>

            <button
              v-if="v.activo"
              @click="darDeBaja(v.id)"
              class="text-yellow-500 mr-2"
              title="Dar de baja"
            >
              ⛔
            </button>

            <button
              v-else
              @click="restaurar(v.id)"
              class="text-green-500 mr-2"
              title="Restaurar"
            >
              ♻️
            </button>

            <button @click="abrirConfirmacion(v.id)" class="text-red-500">
              🗑️
            </button>
          </td>
        </tr>

        <tr v-if="vendedoresFiltrados.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-400">
            No hay vendedores
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex justify-center items-center gap-2 mt-4">
      <button
        @click="page--"
        :disabled="page === 1"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Anterior
      </button>

      <span class="text-sm">
        Página {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        Siguiente
      </button>
    </div>

    <!-- MODAL -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
        <div class="px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <h2 class="text-lg font-bold text-gray-800">
            {{ modoEdicion ? "Editar Vendedor" : "Nuevo Vendedor" }}
          </h2>
        </div>

        <div class="p-6 overflow-y-auto space-y-5">
          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Datos personales
            </h3>

            <div class="space-y-3">
              <div>
                <div class="flex items-center gap-3">
                  <label class="w-18 text-sm font-medium text-gray-700">Nombre *</label>
                  <input
                    v-model="nombre"
                    maxlength="80"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.nombre ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.nombre" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.nombre }}
                </p>
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <label class="w-18 text-sm font-medium text-gray-700">Apellido *</label>
                  <input
                    v-model="apellido"
                    maxlength="80"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.apellido ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.apellido" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.apellido }}
                </p>
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <label class="w-18 text-sm font-medium text-gray-700">DNI *</label>
                  <input
                    v-model="nroDni"
                    maxlength="20"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.nroDni ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.nroDni" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.nroDni }}
                </p>
              </div>

              <div>
                <div class="flex items-center gap-3">
                  <label class="w-32 text-sm font-medium text-gray-700">Fecha nacimiento *</label>
                  <input
                    v-model="fechaNacimiento"
                    type="date"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.fechaNacimiento ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.fechaNacimiento" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.fechaNacimiento }}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Contacto
            </h3>

            <div class="space-y-3">
              <div>
                <div class="flex items-center gap-3">
                  <label class="w-18 text-sm font-medium text-gray-700">Email</label>
                  <input
                    v-model="email"
                    maxlength="120"
                    type="email"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.email ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.email" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.email }}
                </p>
              </div>

              <div class="flex items-center gap-3">
                <label class="w-18 text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  v-model="telefono"
                  maxlength="30"
                  class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
                />
              </div>

              <div class="flex items-center gap-3">
                <label class="w-18 text-sm font-medium text-gray-700">Dirección</label>
                <input
                  v-model="direccion"
                  maxlength="150"
                  class="flex-1 border border-gray-300 px-3 py-2 rounded-md"
                />
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
              Información adicional
            </h3>

            <textarea
              v-model="observaciones"
              maxlength="250"
              rows="3"
              class="w-full border border-gray-300 px-3 py-2 rounded-md resize-none"
              placeholder="Observaciones..."
            ></textarea>
          </div>

          <div class="flex items-center justify-between border-t pt-4">
            <label class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" v-model="activo" />
              Activo
            </label>
          </div>
        </div>

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

    <!-- MODAL DELETE -->
    <div
      v-if="openDeleteModal"
      @click.self="cerrarConfirmacion"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h2 class="text-lg font-bold mb-3 text-gray-800">Confirmar eliminación</h2>

        <p class="text-sm text-gray-600 mb-4">
          ¿Estás seguro que querés eliminar permanentemente este vendedor?
        </p>

        <div class="flex justify-end gap-2">
          <button
            @click="cerrarConfirmacion"
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>

          <button
            @click="confirmarEliminacion"
            class="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useNotificationStore } from "@/stores/notificaciones";
import { useVendedoresStore } from "@/modules/vendedores/store";
import type { Vendedor, CrearVendedorDto } from "@/modules/vendedores/types";

const vendedoresStore = useVendedoresStore();
const notification = useNotificationStore();
const vendedores = computed(() => vendedoresStore.vendedores);

const search = ref("");
const incluirEliminados = ref(false);

const openModal = ref(false);
const openDeleteModal = ref(false);

const modoEdicion = ref(false);
const vendedorEditando = ref<number | null>(null);
const vendedorAEliminar = ref<number | null>(null);

const nombre = ref("");
const apellido = ref("");
const nroDni = ref("");
const email = ref("");
const telefono = ref("");
const direccion = ref("");
const fechaNacimiento = ref("");
const observaciones = ref("");
const activo = ref(true);

const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;

const hoyLocal = () => {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());
  return fecha.toISOString().split("T")[0];
};

const cargarVendedores = async () => {
  await vendedoresStore.fetchVendedores(incluirEliminados.value);
};

watch(search, () => {
  page.value = 1;
});

watch(incluirEliminados, async () => {
  page.value = 1;
  await cargarVendedores();
});

const vendedoresFiltrados = computed(() => {
  return vendedores.value.filter((v) => {
    const texto = search.value.toLowerCase();

    const coincideBusqueda =
      v.nombre.toLowerCase().includes(texto) ||
      v.apellido.toLowerCase().includes(texto) ||
      v.nroDni.toLowerCase().includes(texto) ||
      String(v.email ?? "").toLowerCase().includes(texto);

    const incluir = incluirEliminados.value ? true : v.activo;

    return coincideBusqueda && incluir;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(vendedoresFiltrados.value.length / pageSize);
  return total === 0 ? 1 : total;
});

const vendedoresPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;
  return vendedoresFiltrados.value.slice(start, start + pageSize);
});

const resetForm = () => {
  nombre.value = "";
  apellido.value = "";
  nroDni.value = "";
  email.value = "";
  telefono.value = "";
  direccion.value = "";
  fechaNacimiento.value = hoyLocal();
  observaciones.value = "";
  activo.value = true;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  vendedorEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = async (v: Vendedor) => {
  modoEdicion.value = true;
  vendedorEditando.value = v.id;
  errores.value = {};

  try {
    const data = await vendedoresStore.getVendedorPorId(v.id);
    nombre.value = data.nombre ?? "";
    apellido.value = data.apellido ?? "";
    nroDni.value = data.nroDni ?? "";
    email.value = data.email ?? "";
    telefono.value = data.telefono ?? "";
    direccion.value = data.direccion ?? "";
    fechaNacimiento.value = data.fechaNacimiento ? String(data.fechaNacimiento).split("T")[0] : hoyLocal();
    observaciones.value = data.observaciones ?? "";
    activo.value = data.activo ?? true;

    openModal.value = true;
  } catch (err: any) {
    notification.show(err.response?.data?.error || "No se pudo cargar el vendedor", "error");
  }
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

const validar = () => {
  errores.value = {};

  const regexNombreApellido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!nombre.value.trim()) errores.value.nombre = "El nombre es obligatorio.";
  else if (nombre.value.length < 2) errores.value.nombre = "El nombre debe tener al menos 2 caracteres.";
  else if (nombre.value.length > 80) errores.value.nombre = "El nombre no puede superar los 80 caracteres.";
  else if (!regexNombreApellido.test(nombre.value.trim())) errores.value.nombre = "El nombre no puede contener números ni caracteres especiales.";

  if (!apellido.value.trim()) errores.value.apellido = "El apellido es obligatorio.";
  else if (apellido.value.length < 2) errores.value.apellido = "El apellido debe tener al menos 2 caracteres.";
  else if (apellido.value.length > 80) errores.value.apellido = "El apellido no puede superar los 80 caracteres.";
  else if (!regexNombreApellido.test(apellido.value.trim())) errores.value.apellido = "El apellido no puede contener números ni caracteres especiales.";

  const dni = nroDni.value.trim();
  if (!dni) errores.value.nroDni = "El DNI es obligatorio.";
  else if (!/^\d+$/.test(dni)) errores.value.nroDni = "El DNI debe contener solo números.";
  else if (dni.length < 7 || dni.length > 8) errores.value.nroDni = "El DNI debe tener entre 7 y 8 dígitos.";

  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errores.value.email = "El email no tiene un formato válido.";
  }

  if (!fechaNacimiento.value) {
    errores.value.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
  }

  return Object.keys(errores.value).length === 0;
};

const guardar = async () => {
  if (!validar()) return;

  const dto: CrearVendedorDto = {
    nombre: nombre.value.trim(),
    apellido: apellido.value.trim(),
    nroDni: nroDni.value.trim(),
    email: email.value.trim() || undefined,
    telefono: telefono.value.trim() || undefined,
    direccion: direccion.value.trim() || undefined,
    fechaNacimiento: fechaNacimiento.value || null,
    observaciones: observaciones.value.trim() || undefined,
    activo: activo.value
  };

  let ok = false;
  if (modoEdicion.value && vendedorEditando.value) {
    ok = await vendedoresStore.editVendedor(vendedorEditando.value, dto);
  } else {
    ok = await vendedoresStore.addVendedor(dto);
  }

  if (!ok) return;
  cerrarModal();
  await cargarVendedores();
};

const abrirConfirmacion = (id: number) => {
  vendedorAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  vendedorAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = async () => {
  if (!vendedorAEliminar.value) return;

  const ok = await vendedoresStore.removeVendedor(vendedorAEliminar.value);
  if (!ok) return;

  await cargarVendedores();
  cerrarConfirmacion();
};

const darDeBaja = async (id: number) => {
  const ok = await vendedoresStore.bajaVendedor(id);
  if (!ok) return;
  await cargarVendedores();
};

const restaurar = async (id: number) => {
  const ok = await vendedoresStore.restoreVendedor(id);
  if (!ok) return;
  await cargarVendedores();
};

onMounted(async () => {
  resetForm();
  await cargarVendedores();
});
</script>


