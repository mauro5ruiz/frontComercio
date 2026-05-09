<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Pérdidas</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nueva pérdida
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input
        v-model="search"
        placeholder="Buscar por motivo..."
        class="border px-3 py-2 rounded"
      />

      <select v-model.number="filtroEstado" class="border px-3 py-2 rounded">
        <option :value="0">Todos los estados</option>
        <option :value="1">Pendiente</option>
        <option :value="2">Confirmada</option>
        <option :value="3">Anulada</option>
      </select>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Fecha</th>
          <th class="p-2">Motivo</th>
          <th class="p-2">Observación</th>
          <th class="p-2">Estado</th>
          <th class="p-2">Productos</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="p in perdidasPaginadas"
          :key="p.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2">{{ formatearFecha(p.fecha) }}</td>
          <td class="p-2">{{ p.motivo }}</td>
          <td class="p-2">{{ p.observacion || "-" }}</td>

          <td class="p-2">
            <span :class="colorEstado(p.idEstado)">
              {{ nombreEstado(p.idEstado) }}
            </span>
          </td>

          <td class="p-2">
            {{ p.detalles.length }}
          </td>

          <td class="p-2 text-right space-x-2">

  <!-- EDITAR -->
  <div class="relative inline-block group">
    <button
      @click="abrirEdicion(p)"
      class="text-blue-500"
    >
      ✏️
    </button>

    <div
      class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
             bg-black text-white text-xs px-2 py-1 rounded 
             opacity-0 group-hover:opacity-100 transition pointer-events-none"
    >
      Editar
    </div>
  </div>

  <!-- ELIMINAR -->
  <div class="relative inline-block group">
    <button
      @click="abrirConfirmacion(p.id)"
      class="text-red-500"
    >
      🗑️
    </button>

    <div
      class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
             bg-black text-white text-xs px-2 py-1 rounded 
             opacity-0 group-hover:opacity-100 transition pointer-events-none"
    >
      Eliminar
    </div>
  </div>

  <!-- APROBAR -->
  <div
    v-if="esAdmin && p.idEstado === 1"
    class="relative inline-block group"
  >
    <button
      @click="autorizar(p.id)"
      class="text-green-600"
    >
      ✔️
    </button>

    <div
      class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
             bg-black text-white text-xs px-2 py-1 rounded 
             opacity-0 group-hover:opacity-100 transition pointer-events-none"
    >
      Aprobar
    </div>
  </div>

  <!-- RECHAZAR -->
  <div
    v-if="esAdmin && p.idEstado === 1"
    class="relative inline-block group"
  >
    <button
      @click="rechazar(p.id)"
      class="text-red-600"
    >
      ❌
    </button>

    <div
      class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 
             bg-black text-white text-xs px-2 py-1 rounded 
             opacity-0 group-hover:opacity-100 transition pointer-events-none"
    >
      Rechazar
    </div>
  </div>

</td>
        </tr>

        <tr v-if="perdidasFiltradas.length === 0">
          <td colspan="6" class="text-center py-4 text-gray-400">
            No hay pérdidas
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
        ←
      </button>

      <span class="text-sm">
        Página {{ page }} de {{ totalPaginas }}
      </span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        →
      </button>
    </div>

    <!-- MODAL -->
    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-3xl p-6">
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar pérdida" : "Nueva pérdida" }}
        </h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">
              Motivo *
            </label>

            <input
              v-model="motivo"
              class="w-full border px-3 py-2 rounded"
            />

            <p
              v-if="errores.motivo"
              class="text-xs text-red-500 mt-1"
            >
              {{ errores.motivo }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium mb-1">
              Observación
            </label>

            <textarea
              v-model="observacion"
              rows="3"
              class="w-full border px-3 py-2 rounded"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">
                Productos *
              </label>

              <button
                 @click="agregarDetalle"
                 :disabled="!puedeEditarDetalles"
                 class="bg-green-500 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                 >
                 + Agregar
              </button>
            </div>

            <div
              v-for="(d, index) in detalles"
              :key="index"
              class="grid grid-cols-12 gap-2 mb-2"
            >
              <select
                v-model.number="d.idProducto"
                :disabled="!puedeEditarDetalles"
                class="col-span-7 border px-2 py-2 rounded"
              >
                <option :value="0">--Seleccione un producto --</option>

                <option
                  v-for="p in productos"
                  :key="p.id"
                  :value="p.id"
                >
                  {{ p.nombre }}
                </option>
              </select>

              <input
                v-model.number="d.cantidad"
                type="number"
                min="0.01"
                step="0.01"
                :disabled="!puedeEditarDetalles"
                class="col-span-4 border px-2 py-2 rounded"
              />

              <button
                 @click="eliminarDetalle(index)"
                 :disabled="!puedeEditarDetalles"
                 class="col-span-1 text-red-500 disabled:opacity-50"
                 >
                 ✖
              </button>
            </div>

            <p
              v-if="errores.detalles"
              class="text-xs text-red-500 mt-1"
            >
              {{ errores.detalles }}
            </p>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button
            @click="cerrarModal"
            class="px-4 py-2 rounded bg-gray-200"
          >
            Cancelar
          </button>

          <button
            @click="guardar"
            class="px-4 py-2 rounded bg-blue-500 text-white"
          >
            {{ modoEdicion ? "Actualizar" : "Guardar" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

const openDeleteModal = ref(false);
const perdidaAEliminar = ref<number | null>(null);

const usuario = ref({
  id: 1,
  nombre: "Admin",
  rol: "admin" // o "usuario"
});
const esAdmin = computed(() => usuario.value.rol === "admin");

interface DetallePerdida {
  idProducto: number;
  cantidad: number;
}

interface Perdida {
  id: number;
  fecha: string;
  motivo: string;
  observacion: string;
  idUsuario: number;
  idEstado: number;
  detalles: DetallePerdida[];
}

const productos = ref([
  { id: 1, nombre: "Coca Cola 2.25L" },
  { id: 2, nombre: "Galletitas surtidas" },
  { id: 3, nombre: "Jabón líquido" },
]);

const perdidas = ref<Perdida[]>([
  {
    id: 1,
    fecha: "2026-05-08T10:15:00Z",
    motivo: "Rotura en depósito",
    observacion: "Cajas dañadas por caída",
    idUsuario: 1,
    idEstado: 1,
    detalles: [
      { idProducto: 1, cantidad: 3 },
      { idProducto: 2, cantidad: 2 }
    ]
  },
  {
    id: 2,
    fecha: "2026-05-07T14:30:00Z",
    motivo: "Mercadería vencida",
    observacion: "Control de stock mensual",
    idUsuario: 2,
    idEstado: 2,
    detalles: [
      { idProducto: 3, cantidad: 5 }
    ]
  },
  {
    id: 3,
    fecha: "2026-05-06T09:00:00Z",
    motivo: "Error de inventario",
    observacion: "Diferencia en conteo físico",
    idUsuario: 1,
    idEstado: 3,
    detalles: [
      { idProducto: 1, cantidad: 1 },
      { idProducto: 3, cantidad: 2 }
    ]
  },
  {
    id: 4,
    fecha: "2026-05-05T18:45:00Z",
    motivo: "Robo interno",
    observacion: "Falta en caja de almacén",
    idUsuario: 3,
    idEstado: 1,
    detalles: [
      { idProducto: 2, cantidad: 10 }
    ]
  },
  {
    id: 5,
    fecha: "2026-05-04T11:20:00Z",
    motivo: "Derrame de producto",
    observacion: "Líquidos dañados en transporte",
    idUsuario: 2,
    idEstado: 2,
    detalles: [
      { idProducto: 3, cantidad: 4 }
    ]
  },
  {
    id: 6,
    fecha: "2026-05-03T16:10:00Z",
    motivo: "Daño en almacenamiento",
    observacion: "Estantería colapsó",
    idUsuario: 1,
    idEstado: 1,
    detalles: [
      { idProducto: 1, cantidad: 6 }
    ]
  },
  {
    id: 7,
    fecha: "2026-05-02T08:50:00Z",
    motivo: "Caducidad masiva",
    observacion: "Lote vencido detectado",
    idUsuario: 2,
    idEstado: 3,
    detalles: [
      { idProducto: 2, cantidad: 8 },
      { idProducto: 3, cantidad: 3 }
    ]
  }
]);

const search = ref("");
const filtroEstado = ref(0);

const page = ref(1);
const pageSize = 7;

const openModal = ref(false);
const modoEdicion = ref(false);

const perdidaEditando = ref<number | null>(null);

const motivo = ref("");
const observacion = ref("");

const detalles = ref<DetallePerdida[]>([]);

const errores = ref<Record<string, string>>({});

watch([search, filtroEstado], () => {
  page.value = 1;
});

const puedeEditarDetalles = computed(() => {
  return (
    modoEdicion.value &&
    perdidaEditando.value &&
    perdidas.value.find(p => p.id === perdidaEditando.value)?.idEstado === 1
  );
});

const nombreEstado = (id: number) => {
  switch (id) {
    case 1:
      return "Pendiente";
    case 2:
      return "Confirmada";
    case 3:
      return "Anulada";
    default:
      return "-";
  }
};

const colorEstado = (id: number) => {
  switch (id) {
    case 1:
      return "text-yellow-500";
    case 2:
      return "text-green-600";
    case 3:
      return "text-red-500";
    default:
      return "";
  }
};

const formatearFecha = (valor: string) => {
  return new Date(valor).toLocaleString("es-AR");
};

const perdidasFiltradas = computed(() => {
  const texto = search.value.toLowerCase();

  return perdidas.value.filter((p) => {
    const coincideTexto = p.motivo.toLowerCase().includes(texto);

    const coincideEstado = filtroEstado.value === 0 ? true : p.idEstado === filtroEstado.value;
    return coincideTexto && coincideEstado;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(
    perdidasFiltradas.value.length / pageSize
  );

  return total || 1;
});

const perdidasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;

  return perdidasFiltradas.value.slice(
    start,
    start + pageSize
  );
});

const resetForm = () => {
  motivo.value = "";
  observacion.value = "";

  detalles.value = [];

  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;

  perdidaEditando.value = null;

  resetForm();

  agregarDetalle();

  openModal.value = true;
};

const abrirEdicion = (p: Perdida) => {
  modoEdicion.value = true;

  perdidaEditando.value = p.id;

  motivo.value = p.motivo;
  observacion.value = p.observacion;

  detalles.value = p.detalles.map((d) => ({
    ...d,
  }));

  openModal.value = true;
};

const abrirConfirmacion = (id: number) => {
  perdidaAEliminar.value = id;
  openDeleteModal.value = true;
};
const cerrarConfirmacion = () => {
  perdidaAEliminar.value = null;
  openDeleteModal.value = false;
};
const confirmarEliminacion = () => {
  if (!perdidaAEliminar.value) return;

  perdidas.value = perdidas.value.filter(
    p => p.id !== perdidaAEliminar.value
  );

  cerrarConfirmacion();
};

const autorizar = (id: number) => {
  const p = perdidas.value.find(x => x.id === id);
  if (!p) return;

  p.idEstado = 2; // Confirmada
};

const rechazar = (id: number) => {
  const perdida = perdidas.value.find(p => p.id === id);
  if (!perdida) return;

  perdida.idEstado = 3; // Anulada
};

const cerrarModal = () => {
  openModal.value = false;
};

const agregarDetalle = () => {
  detalles.value.push({
    idProducto: 0,
    cantidad: 1,
  });
};

const eliminarDetalle = (index: number) => {
  detalles.value.splice(index, 1);
};

const validar = () => {
  errores.value = {};

  if (!motivo.value.trim()) {
    errores.value.motivo =
      "El motivo es obligatorio.";
  }

  if (!detalles.value.length) {
    errores.value.detalles =
      "Debe agregar productos.";
  }

  const detalleInvalido = detalles.value.some(
    (d) => !d.idProducto || d.cantidad <= 0
  );

  if (detalleInvalido) 
    errores.value.detalles = "Complete correctamente los productos.";

  return Object.keys(errores.value).length === 0;
};

const guardar = () => {
  if (!validar()) return;

  if (modoEdicion.value) 
  {
    const perdida = perdidas.value.find(p => p.id === perdidaEditando.value);

    if (perdida && perdida.idEstado !== 1) {
        // SOLO bloquear cambios de detalles
        const original = perdida.detalles;

        const modificado = detalles.value;

        const hayCambios =
        JSON.stringify(original) !== JSON.stringify(modificado);

        if (hayCambios) {
        errores.value.detalles = "No se pueden modificar productos en pérdidas confirmadas o anuladas.";
        return;
        }
    }
  }

  if (modoEdicion.value && perdidaEditando.value) {
    const index = perdidas.value.findIndex((p) => p.id === perdidaEditando.value);

    if (index !== -1) {
      perdidas.value[index] = {
        ...perdidas.value[index]!,
        motivo: motivo.value,
        observacion: observacion.value,
        detalles: [...detalles.value],
      };
    }
  } 
  else {
    const nuevoId = Math.max(...perdidas.value.map((p) => p.id), 0) + 1;

    perdidas.value.unshift({
      id: nuevoId,
      fecha: new Date().toISOString(),
      motivo: motivo.value,
      observacion: observacion.value,
      idUsuario: 1,
      idEstado: 1,
      detalles: [...detalles.value],
    });
  }

  cerrarModal();
};
</script>
