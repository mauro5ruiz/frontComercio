<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">
      Kardex de Stock
    </h1>

    <!-- FILTRO -->
    <div class="flex justify-center mb-6">
      <div class="bg-white rounded shadow p-6 w-full max-w-2xl">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">

          <!-- PRODUCTO -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium mb-1">
              Producto *
            </label>

            <select
              v-model.number="idProducto"
              class="w-full border px-3 py-2 rounded"
            >
              <option :value="0">
                -- Seleccione un producto --
              </option>

              <option
                v-for="p in productos"
                :key="p.id"
                :value="p.id"
              >
                {{ p.nombre }}
              </option>
            </select>
          </div>

        </div>
      </div>
    </div>

    <!-- INFO PRODUCTO -->
    <div
      v-if="productoSeleccionado"
      class="bg-white rounded shadow p-4 mb-6"
    >
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-lg font-bold">
            {{ productoSeleccionado.nombre }}
          </h2>

          <p class="text-gray-500 text-sm">
            Historial de movimientos de stock
          </p>
        </div>

        <div class="text-right">
          <p class="text-sm text-gray-500">
            Stock actual
          </p>

          <p class="text-2xl font-bold text-blue-600">
            {{ stockActual }}
          </p>
        </div>
      </div>
    </div>

    <!-- TABLA -->
    <div class="bg-white rounded shadow overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b text-left bg-gray-50">
            <th class="p-3">Fecha</th>
            <th class="p-3">Tipo movimiento</th>
            <th class="p-3">Cantidad</th>
            <th class="p-3">Referencia</th>
            <th class="p-3">Observaciones</th>
            <th class="p-3">Stock acumulado</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="m in movimientosPaginados"
            :key="m.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="p-3">
              {{ formatearFecha(m.fecha) }}
            </td>

            <td class="p-3">
              <span :class="colorMovimiento(m.idTipoMovimientoStock)">
                {{ nombreMovimiento(m.idTipoMovimientoStock) }}
              </span>
            </td>

            <td
              class="p-3 font-semibold"
              :class="m.cantidad >= 0 ? 'text-green-600' : 'text-red-500'"
            >
              {{ m.cantidad > 0 ? "+" : "" }}{{ m.cantidad }}
            </td>

            <td class="p-3">
              {{ m.idReferencia || "-" }}
            </td>

            <td class="p-3">
              {{ m.observaciones || "-" }}
            </td>

            <td class="p-3 font-bold">
              {{ m.stockAcumulado }}
            </td>
          </tr>

          <tr v-if="!movimientosFiltrados.length">
            <td colspan="6" class="text-center py-6 text-gray-400">
              {{ idProducto ? "No hay movimientos para este producto" : "Seleccione un producto para ver el kardex" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- PAGINADO -->
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
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";

interface MovimientoStock {
  id: number;
  idProducto: number;
  fecha: string;
  cantidad: number;
  idTipoMovimientoStock: number;
  idReferencia?: number | null;
  observaciones?: string;
  stockAcumulado: number;
}

const productos = ref([
  {
    id: 1,
    nombre: "Coca Cola 2.25L"
  },
  {
    id: 2,
    nombre: "Galletitas surtidas"
  },
  {
    id: 3,
    nombre: "Jabón líquido"
  }
]);

const idProducto = ref(0);

const movimientosBase = ref<Omit<MovimientoStock, "stockAcumulado">[]>([
  {
    id: 1,
    idProducto: 1,
    fecha: "2026-05-01T10:00:00",
    cantidad: 50,
    idTipoMovimientoStock: 1,
    idReferencia: 1001,
    observaciones: "Ingreso compra proveedor"
  },
  {
    id: 2,
    idProducto: 1,
    fecha: "2026-05-02T14:20:00",
    cantidad: -5,
    idTipoMovimientoStock: 2,
    idReferencia: 2001,
    observaciones: "Venta mostrador"
  },
  {
    id: 3,
    idProducto: 1,
    fecha: "2026-05-03T09:15:00",
    cantidad: -2,
    idTipoMovimientoStock: 3,
    idReferencia: null,
    observaciones: "Producto vencido"
  },
  {
    id: 4,
    idProducto: 2,
    fecha: "2026-05-04T16:45:00",
    cantidad: 3,
    idTipoMovimientoStock: 4,
    idReferencia: null,
    observaciones: "Ajuste inventario"
  },
  {
    id: 5,
    idProducto: 3,
    fecha: "2026-05-05T11:30:00",
    cantidad: -10,
    idTipoMovimientoStock: 2,
    idReferencia: 2002,
    observaciones: "Venta delivery"
  },
  {
    id: 6,
    idProducto: 2,
    fecha: "2026-05-06T08:10:00",
    cantidad: 20,
    idTipoMovimientoStock: 1,
    idReferencia: 1002,
    observaciones: "Nueva compra"
  }
]);

const productoSeleccionado = computed(() => {
  return productos.value.find(
    p => p.id === idProducto.value
  );
});

const movimientosFiltrados = computed<MovimientoStock[]>(() => {
  if (!idProducto.value) return [];

  const movimientos = movimientosBase.value
    .filter((m) => m.idProducto === idProducto.value)
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());

  let acumulado = 0;

  return movimientos.map((m) => {
    acumulado += m.cantidad;
    return {
      ...m,
      stockAcumulado: acumulado
    };
  });
});

const stockActual = computed(() => {
  if (!movimientosFiltrados.value.length)
    return 0;

  return movimientosFiltrados.value[
    movimientosFiltrados.value.length - 1
  ]?.stockAcumulado ?? 0;
});

const page = ref(1);
const pageSize = 5;

const totalPaginas = computed(() => {
      return (
    Math.ceil(
      movimientosFiltrados.value.length / pageSize
    ) || 1
  );
});

const movimientosPaginados = computed(() => {
  const start = (page.value - 1) * pageSize;

  return movimientosFiltrados.value.slice(
    start,
    start + pageSize
  );
});

watch(idProducto, () => {
  page.value = 1;
});

const nombreMovimiento = (id: number) => {
  switch (id) {
    case 1:
      return "Compra";

    case 2:
      return "Venta";

    case 3:
      return "Pérdida";

    case 4:
      return "Ajuste";

    default:
      return "Movimiento";
  }
};

const colorMovimiento = (id: number) => {
  switch (id) {
    case 1:
      return "text-green-600";

    case 2:
      return "text-blue-600";

    case 3:
      return "text-red-500";

    case 4:
      return "text-yellow-600";

    default:
      return "";
  }
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha)
    .toLocaleString("es-AR");
};

</script>
