<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-4">Ofertas</h1>

    <div class="flex justify-end mb-4">
      <button
        @click="abrirCrear"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        + Nueva oferta
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      <input
        v-model="search"
        placeholder="Buscar por producto..."
        class="border px-3 py-2 rounded"
      />
      <select v-model.number="filtroTipo" class="border px-3 py-2 rounded">
        <option :value="0">Todos los tipos</option>
        <option :value="1">Porcentaje</option>
        <option :value="2">Monto fijo</option>
      </select>
      <label class="flex items-center gap-2 text-sm">
        <input type="checkbox" v-model="incluirInactivas" />
        Incluir inactivas
      </label>
    </div>

    <table class="w-full bg-white rounded shadow">
      <thead>
        <tr class="text-left border-b">
          <th class="p-2">Producto</th>
          <th class="p-2">Tipo</th>
          <th class="p-2">Valor</th>
          <th class="p-2">Inicio</th>
          <th class="p-2">Fin</th>
          <th class="p-2">Activa</th>
          <th class="p-2 text-right">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="o in ofertasPaginadas"
          :key="o.id"
          class="border-b hover:bg-gray-50"
        >
          <td class="p-2">{{ nombreProducto(o.idProducto) }}</td>
          <td class="p-2">{{ nombreTipo(o.tipoDescuentoId) }}</td>
          <td class="p-2">{{ formatearValor(o.tipoDescuentoId, o.valorDescuento) }}</td>
          <td class="p-2">{{ formatearFecha(o.fechaInicio) }}</td>
          <td class="p-2">{{ formatearFecha(o.fechaFin) }}</td>
          <td class="p-2">
            <span :class="o.activa ? 'text-green-600' : 'text-red-500'">
              {{ o.activa ? "Sí" : "No" }}
            </span>
          </td>
          <td class="p-2 text-right">
            <button @click="abrirEdicion(o)" class="text-blue-500 mr-2">✏️</button>
            <button @click="abrirConfirmacion(o.id)" class="text-red-500">🗑️</button>
          </td>
        </tr>
        <tr v-if="ofertasFiltradas.length === 0">
          <td colspan="7" class="text-center py-4 text-gray-400">No hay ofertas</td>
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

      <span class="text-sm">Página {{ page }} de {{ totalPaginas }}</span>

      <button
        @click="page++"
        :disabled="page === totalPaginas"
        class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
      >
        →
      </button>
    </div>

    <div
      v-if="openModal"
      @click.self="cerrarModal"
      class="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div class="bg-white rounded-lg shadow-lg w-full max-w-lg p-6">
        <h2 class="text-lg font-bold mb-4">
          {{ modoEdicion ? "Editar oferta" : "Nueva oferta" }}
        </h2>

        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
            <select
              v-model.number="idProducto"
              class="w-full border px-3 py-2 rounded"
              :class="errores.idProducto ? 'border-red-400' : 'border-gray-300'"
            >
              <option :value="0">Seleccionar</option>
              <option v-for="p in productos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
            <p v-if="errores.idProducto" class="text-xs text-red-500 mt-1">{{ errores.idProducto }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de descuento *</label>
            <select
              v-model.number="tipoDescuentoId"
              class="w-full border px-3 py-2 rounded"
              :class="errores.tipoDescuentoId ? 'border-red-400' : 'border-gray-300'"
            >
              <option :value="0">Seleccionar</option>
              <option :value="1">Porcentaje</option>
              <option :value="2">Monto fijo</option>
            </select>
            <p v-if="errores.tipoDescuentoId" class="text-xs text-red-500 mt-1">{{ errores.tipoDescuentoId }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor descuento *</label>
            <input
              v-model.number="valorDescuento"
              type="number"
              step="0.01"
              min="0"
              class="w-full border px-3 py-2 rounded"
              :class="errores.valorDescuento ? 'border-red-400' : 'border-gray-300'"
            />
            <p v-if="errores.valorDescuento" class="text-xs text-red-500 mt-1">{{ errores.valorDescuento }}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
              <input
                v-model="fechaInicio"
                type="datetime-local"
                class="w-full border px-3 py-2 rounded"
                :class="errores.fechaInicio ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errores.fechaInicio" class="text-xs text-red-500 mt-1">{{ errores.fechaInicio }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
              <input
                v-model="fechaFin"
                type="datetime-local"
                class="w-full border px-3 py-2 rounded"
                :class="errores.fechaFin ? 'border-red-400' : 'border-gray-300'"
              />
              <p v-if="errores.fechaFin" class="text-xs text-red-500 mt-1">{{ errores.fechaFin }}</p>
            </div>
          </div>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" v-model="activa" />
            Activa
          </label>
        </div>

        <div class="flex justify-end gap-2 mt-5">
          <button @click="cerrarModal" class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">
            Cancelar
          </button>
          <button @click="guardar" class="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
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
        <p class="text-sm text-gray-600 mb-4">¿Estás seguro que querés eliminar esta oferta?</p>
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
import { computed, ref, watch } from "vue";

interface Oferta {
  id: number;
  idProducto: number;
  tipoDescuentoId: number;
  valorDescuento: number;
  fechaInicio: string;
  fechaFin: string;
  activa: boolean;
}

const productos = ref([
  { id: 1, nombre: "Coca Cola 2.25L", precioVenta: 3000 },
  { id: 2, nombre: "Galletitas surtidas", precioVenta: 1200 },
  { id: 3, nombre: "Jabón líquido", precioVenta: 980 },
]);

const ofertas = ref<Oferta[]>([
  {
    id: 1,
    idProducto: 1,
    tipoDescuentoId: 1,
    valorDescuento: 15,
    fechaInicio: "2026-05-01T08:00",
    fechaFin: "2026-05-31T23:59",
    activa: true,
  },
  {
    id: 2,
    idProducto: 2,
    tipoDescuentoId: 2,
    valorDescuento: 400,
    fechaInicio: "2026-05-04T09:00",
    fechaFin: "2026-05-06T23:59",
    activa: true,
  },
]);

const search = ref("");
const filtroTipo = ref(0);
const incluirInactivas = ref(false);

const page = ref(1);
const pageSize = 7;

const openModal = ref(false);
const openDeleteModal = ref(false);
const modoEdicion = ref(false);
const ofertaEditando = ref<number | null>(null);
const ofertaAEliminar = ref<number | null>(null);

const idProducto = ref(0);
const precioVenta = ref(0);
const tipoDescuentoId = ref(0);
const valorDescuento = ref(0);
const fechaInicio = ref("");
const fechaFin = ref("");
const activa = ref(true);

const errores = ref<Record<string, string | undefined>>({});

watch([search, filtroTipo, incluirInactivas], () => {
  page.value = 1;
});

const nombreProducto = (id: number) => {
  return productos.value.find((p) => p.id === id)?.nombre ?? "Producto";
};

const nombreTipo = (id: number) => (id === 1 ? "Porcentaje" : "Monto fijo");

const formatearValor = (tipo: number, valor: number) => {
  return tipo === 1 ? `${valor}%` : `$ ${valor}`;
};

const formatearFecha = (valor: string) => {
  if (!valor) return "-";
  return new Date(valor).toLocaleString("es-AR");
};

const ofertasFiltradas = computed(() => {
  const texto = search.value.toLowerCase();
  return ofertas.value.filter((o) => {
    const coincideTexto = nombreProducto(o.idProducto).toLowerCase().includes(texto);
    const coincideTipo = filtroTipo.value ? o.tipoDescuentoId === filtroTipo.value : true;
    const coincideActiva = incluirInactivas.value ? true : o.activa;
    return coincideTexto && coincideTipo && coincideActiva;
  });
});

const totalPaginas = computed(() => {
  const total = Math.ceil(ofertasFiltradas.value.length / pageSize);
  return total === 0 ? 1 : total;
});

const ofertasPaginadas = computed(() => {
  const start = (page.value - 1) * pageSize;
  return ofertasFiltradas.value.slice(start, start + pageSize);
});

const resetForm = () => {
  idProducto.value = 0;
  precioVenta.value = 0;
  tipoDescuentoId.value = 0;
  valorDescuento.value = 0;
  fechaInicio.value = "";
  fechaFin.value = "";
  activa.value = true;
  errores.value = {};
};

const abrirCrear = () => {
  modoEdicion.value = false;
  ofertaEditando.value = null;

  resetForm();

  const hoy = new Date();

  const yyyy = hoy.getFullYear();
  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
  const dd = String(hoy.getDate()).padStart(2, "0");

  fechaInicio.value = `${yyyy}-${mm}-${dd}T00:00`;
  fechaFin.value = `${yyyy}-${mm}-${dd}T23:59`;

  openModal.value = true;
};

const abrirEdicion = (o: Oferta) => {
  modoEdicion.value = true;
  ofertaEditando.value = o.id;
  errores.value = {};
  idProducto.value = o.idProducto;
  tipoDescuentoId.value = o.tipoDescuentoId;
  valorDescuento.value = o.valorDescuento;
  fechaInicio.value = o.fechaInicio;
  fechaFin.value = o.fechaFin;
  activa.value = o.activa;
  openModal.value = true;
};

const cerrarModal = () => {
  openModal.value = false;
};

const validar = () => {
  errores.value = {};

  if (!idProducto.value) errores.value.idProducto = "El producto es obligatorio.";
  if (!tipoDescuentoId.value) errores.value.tipoDescuentoId = "El tipo es obligatorio.";
  if (valorDescuento.value <= 0) errores.value.valorDescuento = "El valor debe ser mayor a 0.";
  if (tipoDescuentoId.value === 1 && valorDescuento.value > 100) {
    errores.value.valorDescuento = "El porcentaje no puede ser mayor a 100.";
  }
  const precioVentaProducto = productos.value.find(p => p.id == idProducto.value)?.precioVenta;
  if (precioVentaProducto && tipoDescuentoId.value === 2 && valorDescuento.value > precioVentaProducto) {   
    errores.value.valorDescuento = `El precio de descuento no puede superar al precio de venta ($ ${precioVentaProducto}).`;
  }
  if (!fechaInicio.value) errores.value.fechaInicio = "La fecha de inicio es obligatoria.";
  if (!fechaFin.value) errores.value.fechaFin = "La fecha de fin es obligatoria.";
  if (fechaInicio.value && fechaFin.value && new Date(fechaFin.value) <= new Date(fechaInicio.value)) {
    errores.value.fechaFin = "La fecha de fin debe ser mayor a la fecha de inicio.";
  }
  const ahora = new Date();
  if (fechaFin.value) {
    const fechaHastaDate = new Date(fechaFin.value);
    if (fechaHastaDate < ahora) 
      errores.value.fechaFin = "La fecha hasta no puede ser menor a la fecha actual.";
  }
    return Object.keys(errores.value).length === 0;
  };

const guardar = () => {
  if (!validar()) return;

  if (modoEdicion.value && ofertaEditando.value) {
    const index = ofertas.value.findIndex((o) => o.id === ofertaEditando.value);
    if (index !== -1) {
      ofertas.value[index] = {
        ...ofertas.value[index]!,
        idProducto: idProducto.value,
        tipoDescuentoId: tipoDescuentoId.value,
        valorDescuento: valorDescuento.value,
        fechaInicio: fechaInicio.value,
        fechaFin: fechaFin.value,
        activa: activa.value,
      };
    }
  } else {
    const nuevoId = Math.max(...ofertas.value.map((o) => o.id), 0) + 1;
    ofertas.value.unshift({
      id: nuevoId,
      idProducto: idProducto.value,
      tipoDescuentoId: tipoDescuentoId.value,
      valorDescuento: valorDescuento.value,
      fechaInicio: fechaInicio.value,
      fechaFin: fechaFin.value,
      activa: activa.value,
    });
  }

  cerrarModal();
};

const abrirConfirmacion = (id: number) => {
  ofertaAEliminar.value = id;
  openDeleteModal.value = true;
};

const cerrarConfirmacion = () => {
  ofertaAEliminar.value = null;
  openDeleteModal.value = false;
};

const confirmarEliminacion = () => {
  if (!ofertaAEliminar.value) return;
  ofertas.value = ofertas.value.filter((o) => o.id !== ofertaAEliminar.value);
  cerrarConfirmacion();
};
</script>
