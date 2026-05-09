<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Vendedores</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        ➕ Nuevo vendedor
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
          <th class="p-2 text-center">Compras realizadas</th>
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

          <td class="p-2 text-center">
            <span
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
            >
              🛒 {{ v.comprasRealizadas }}
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
          <td colspan="7" class="text-center py-4 text-gray-400">
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
              Configuración
            </h3>

            <div class="space-y-3">
              <div>
                <div class="flex items-center gap-3">
                  <label class="w-10 text-sm font-medium text-gray-700">PIN *</label>
                  <input
                    v-model="pinHash"
                    maxlength="20"
                    type="password"
                    class="flex-1 border px-3 py-2 rounded-md"
                    :class="errores.pinHash ? 'border-red-400' : 'border-gray-300'"
                  />
                </div>
                <p v-if="errores.pinHash" class="text-xs text-red-500 mt-1 ml-43">
                  {{ errores.pinHash }}
                </p>
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
import { ref, computed, watch } from "vue";

interface VendedorMock {
  id: number;
  nombre: string;
  apellido: string;
  nroDni: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  fechaNacimiento: string;
  activo: boolean;
  fechaAlta: string;
  fechaEliminado?: string | null;
  observaciones?: string;
  pinHash: string;
  idSucursal: number;
  comprasRealizadas: number;
}

const sucursales = ref([
  { id: 1, nombre: "Casa Central" },
  { id: 2, nombre: "Sucursal Norte" },
  { id: 3, nombre: "Sucursal Sur" },
]);

const vendedores = ref<VendedorMock[]>([
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    nroDni: "30111222",
    email: "juan@demo.com",
    telefono: "2227-555555",
    direccion: "Av. Alem 123",
    fechaNacimiento: "1990-04-15",
    activo: true,
    fechaAlta: "2026-05-01",
    fechaEliminado: null,
    observaciones: "",
    pinHash: "1234",
    idSucursal: 1,
    comprasRealizadas: 12,
  },
  {
    id: 2,
    nombre: "María",
    apellido: "Gómez",
    nroDni: "32555666",
    email: "maria@demo.com",
    telefono: "2227-444444",
    direccion: "Belgrano 456",
    fechaNacimiento: "1992-09-20",
    activo: true,
    fechaAlta: "2026-05-02",
    fechaEliminado: null,
    observaciones: "",
    pinHash: "4567",
    idSucursal: 2,
    comprasRealizadas: 1,
  },
  {
    id: 3,
    nombre: "Carlos",
    apellido: "López",
    nroDni: "28999888",
    email: "",
    telefono: "2227-333333",
    direccion: "",
    fechaNacimiento: "1988-12-10",
    activo: false,
    fechaAlta: "2026-05-03",
    fechaEliminado: "2026-05-06",
    observaciones: "Vendedor dado de baja temporalmente",
    pinHash: "9999",
    idSucursal: 3,
    comprasRealizadas: 6,
  },
]);

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
const observaciones = ref("");
const pinHash = ref("");
const idSucursal = ref(0);
const activo = ref(true);

const errores = ref<Record<string, string | undefined>>({});

const page = ref(1);
const pageSize = 7;

watch(search, () => {
  page.value = 1;
});

watch(incluirEliminados, () => {
  page.value = 1;
});

const vendedoresFiltrados = computed(() => {
  return vendedores.value.filter((v) => {
    const texto = search.value.toLowerCase();

    const coincideBusqueda =
      v.nombre.toLowerCase().includes(texto) ||
      v.apellido.toLowerCase().includes(texto) ||
      v.nroDni.toLowerCase().includes(texto) ||
      (v.email ?? "").toLowerCase().includes(texto);

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

const obtenerSucursal = (id: number) => {
  return sucursales.value.find((s) => s.id === id)?.nombre ?? "-";
};

const resetForm = () => {
  nombre.value = "";
  apellido.value = "";
  nroDni.value = "";
  email.value = "";
  telefono.value = "";
  direccion.value = "";
  fechaNacimiento.value = hoyLocal();
  observaciones.value = "";
  pinHash.value = "";
  idSucursal.value = 0;
  activo.value = true;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  vendedorEditando.value = null;
  resetForm();
  openModal.value = true;
};

const abrirEdicion = (v: VendedorMock) => {
  modoEdicion.value = true;
  vendedorEditando.value = v.id;
  errores.value = {};

  nombre.value = v.nombre;
  apellido.value = v.apellido;
  nroDni.value = v.nroDni;
  email.value = v.email ?? "";
  telefono.value = v.telefono ?? "";
  direccion.value = v.direccion ?? "";
  fechaNacimiento.value = v.fechaNacimiento;
  observaciones.value = v.observaciones ?? "";
  pinHash.value = v.pinHash;
  idSucursal.value = v.idSucursal;
  activo.value = v.activo;

  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
  errores.value = {};
};

const validar = () => {
  errores.value = {};

 const regexNombreApellido = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!nombre.value.trim()) 
    errores.value.nombre = "El nombre es obligatorio.";
  else if (nombre.value.length < 2) 
    errores.value.nombre = "El nombre debe tener al menos 2 caracteres.";
  else if (nombre.value.length > 80) 
    errores.value.nombre = "El nombre no puede superar los 80 caracteres.";
  else if (!regexNombreApellido.test(nombre.value.trim())) 
    errores.value.nombre = "El nombre no puede contener números ni caracteres especiales.";

  if (!apellido.value.trim()) 
    errores.value.apellido = "El apellido es obligatorio.";
  else if (apellido.value.length < 2) 
    errores.value.apellido = "El apellido debe tener al menos 2 caracteres.";
  else if (apellido.value.length > 80) 
    errores.value.apellido = "El apellido no puede superar los 80 caracteres.";
  else if (!regexNombreApellido.test(apellido.value.trim())) 
    errores.value.apellido = "El apellido no puede contener números ni caracteres especiales.";

  const dni = nroDni.value.trim();
  if (!dni) 
    errores.value.nroDni = "El DNI es obligatorio.";
  else if (!/^\d+$/.test(dni)) 
    errores.value.nroDni = "El DNI debe contener solo números.";
  else if (dni.length < 7 || dni.length > 8) 
    errores.value.nroDni = "El DNI debe tener entre 7 y 8 dígitos.";

  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errores.value.email = "El email no tiene un formato válido.";
  }

  if (!fechaNacimiento.value) {
    errores.value.fechaNacimiento = "La fecha de nacimiento es obligatoria.";
  }

  if (!pinHash.value.trim()) {
    errores.value.pinHash = "El PIN es obligatorio.";
  }

  if (pinHash.value.length < 4) {
    errores.value.pinHash = "El PIN debe tener al menos 4 caracteres.";
  }

  if (!idSucursal.value) {
    errores.value.idSucursal = "La sucursal es obligatoria.";
  }

  return Object.keys(errores.value).length === 0;
};

const hoyLocal = () => {
  const fecha = new Date();
  fecha.setMinutes(fecha.getMinutes() - fecha.getTimezoneOffset());

  return fecha.toISOString().split("T")[0];
};
const fechaNacimiento = ref(hoyLocal());

const guardar = () => {
  if (!validar()) return;

  if (modoEdicion.value && vendedorEditando.value) {
    const index = vendedores.value.findIndex((v) => v.id === vendedorEditando.value);

    if (index !== -1) {
      vendedores.value[index] = {
        ...vendedores.value[index],
        nombre: nombre.value,
        apellido: apellido.value,
        nroDni: nroDni.value,
        email: email.value || undefined,
        telefono: telefono.value || undefined,
        direccion: direccion.value || undefined,
        fechaNacimiento: fechaNacimiento.value,
        observaciones: observaciones.value || undefined,
        pinHash: pinHash.value,
        idSucursal: idSucursal.value,
        activo: activo.value,
        fechaEliminado: activo.value ? null : vendedores.value[index].fechaEliminado,
      };
    }
  } else {
    const nuevoId = Math.max(...vendedores.value.map((v) => v.id), 0) + 1;

    vendedores.value.unshift({
      id: nuevoId,
      nombre: nombre.value,
      apellido: apellido.value,
      nroDni: nroDni.value,
      email: email.value || undefined,
      telefono: telefono.value || undefined,
      direccion: direccion.value || undefined,
      fechaNacimiento: fechaNacimiento.value,
      activo: activo.value,
      fechaAlta: new Date().toISOString().substring(0, 10),
      fechaEliminado: activo.value ? null : new Date().toISOString().substring(0, 10),
      observaciones: observaciones.value || undefined,
      pinHash: pinHash.value,
      idSucursal: idSucursal.value,
    });
  }

  cerrarModal();
};

const abrirConfirmacion = (id: number) => {
  vendedorAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  vendedorAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = () => {
  if (!vendedorAEliminar.value) return;

  vendedores.value = vendedores.value.filter((v) => v.id !== vendedorAEliminar.value);
  cerrarConfirmacion();
};

const darDeBaja = (id: number) => {
  const vendedor = vendedores.value.find((v) => v.id === id);

  if (vendedor) {
    vendedor.activo = false;
    vendedor.fechaEliminado = new Date().toISOString().substring(0, 10);
  }
};

const restaurar = (id: number) => {
  const vendedor = vendedores.value.find((v) => v.id === id);

  if (vendedor) {
    vendedor.activo = true;
    vendedor.fechaEliminado = null;
  }
};
</script>